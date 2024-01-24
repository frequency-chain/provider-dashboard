import { writable, type Writable } from 'svelte/store';
import { ApiPromise, Keyring } from '@polkadot/api';
import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import type { AccountMap, MetaMap } from '$lib/polkadotApi';
import { getMsaInfo } from '$lib/polkadotApi';
import { Network, networkToInfo } from '$lib/stores/networksStore';
import { isFunction } from '@polkadot/util';

//Only provider accounts
export const storeProviderAccounts = writable({});

export async function fetchAccounts(
  selectedNetwork: Network,
  thisWeb3Enable: typeof web3Enable,
  thisWeb3Accounts: typeof web3Accounts,
  apiPromise: ApiPromise
) {
  console.log('fetchAccounts() - ', selectedNetwork);
  const selectedNetworkInfo = networkToInfo[selectedNetwork];
  // populating for localhost and for a parachain are different since with localhost, there is
  // access to the Alice/Bob/Charlie accounts etc., and so won't use the extension.
  let foundAccounts: AccountMap | MetaMap = {}; // eslint-disable-line prefer-const
  if (selectedNetwork === Network.LOCALHOST) {
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
      if (!a.meta.genesisHash || selectedNetworkInfo.genesisHash === a.meta.genesisHash) {
        foundAccounts[a.address] = a;
      }
    });
  }

  const foundProviderAccounts: AccountMap | MetaMap = {};
  for (const index in Object.keys(foundAccounts)) {
    const account = Object.values(foundAccounts)[index];
    const { isProvider } = await getMsaInfo(apiPromise, account.address);
    if (isProvider) foundProviderAccounts[account.address] = account;
  }
  storeProviderAccounts.set(foundProviderAccounts);
}
