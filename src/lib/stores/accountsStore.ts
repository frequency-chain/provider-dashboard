import { writable } from 'svelte/store';
import { ApiPromise, Keyring } from '@polkadot/api';
import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import type { AccountMap, MetaMap } from '$lib/polkadotApi';
import { getMsaInfo } from '$lib/polkadotApi';
import { isFunction } from '@polkadot/util';
import type { NetworkInfo } from './networksStore';

// All accounts
export const storeValidAccounts = writable<string[]>([]);
// Only provider accounts
export const storeProviderAccounts = writable<string[]>([]);

export async function fetchAccounts(
  selectedNetwork: NetworkInfo,
  thisWeb3Enable: typeof web3Enable,
  thisWeb3Accounts: typeof web3Accounts,
  apiPromise: ApiPromise
) {
  console.log('fetchAccounts() - ', selectedNetwork);
  // populating for localhost and for a parachain are different since with localhost, there is
  // access to the Alice/Bob/Charlie accounts etc., and so won't use the extension.
  let foundAccounts: AccountMap | MetaMap = {}; // eslint-disable-line prefer-const

  if (selectedNetwork.name === 'LOCALHOST') {
    const keyring = new Keyring({ type: 'sr25519' });

    ['//Alice', '//Bob', '//Charlie', '//Dave', '//Eve', '//Ferdie'].forEach((accountName) => {
      const account = { ...keyring.addFromUri(accountName), ...{ meta: { name: accountName } } };
      foundAccounts[account.address] = account;
    });
  }
  // If the Polkadot extension is installed, add the accounts to the list
  if (isFunction(thisWeb3Accounts) && isFunction(thisWeb3Enable)) {
    const extensions = await thisWeb3Enable('Frequency parachain provider dashboard');
    if (!extensions || !extensions.length) {
      alert('Polkadot{.js} extension not found; please install it first.');
      throw new Error('Polkadot{.js} extension not found; please install it first.');
    }

    const allAccounts = await thisWeb3Accounts();
    allAccounts.forEach((a) => {
      // include only the accounts allowed for this chain
      if (!a.meta.genesisHash || selectedNetwork.genesisHash === a.meta.genesisHash) {
        foundAccounts[a.address] = a;
      }
    });
  }

  // Segment into provider accounts and non-provider accounts
  const regularAccounts: string[] = [];
  const providerAccounts: string[] = [];

  for (const address in foundAccounts) {
    const { isProvider } = await getMsaInfo(apiPromise, address);
    if (isProvider) {
      providerAccounts.push(address);
    } else {
      regularAccounts.push(address);
    }
  }

  storeProviderAccounts.set(providerAccounts);
  storeValidAccounts.set(regularAccounts);
}
