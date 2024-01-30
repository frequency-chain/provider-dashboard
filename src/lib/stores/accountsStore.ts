import { writable } from 'svelte/store';
import { Keyring, type ApiPromise } from '@polkadot/api';
import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { getMsaInfo } from '$lib/polkadotApi';
import { isFunction } from '@polkadot/util';
import type { NetworkInfo } from './networksStore';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { MsaInfo } from '$lib/storeTypes';
import type { SigningKey } from '$lib/connections';
import { providerNameToHuman } from '$lib/utils';

export class Account {
  network?: NetworkInfo;
  address: string = '';
  signingKey?: SigningKey;
  msaId?: number;
  isProvider: boolean = false;
  providerName?: string;

  constructor() {
    this.address = '';
  }
}

export const providerAccountsStore = writable<Map<string, Account>>(new Map<string, Account>());
export const nonProviderAccountsStore = writable<Map<string, Account>>(new Map<string, Account>());

export async function fetchAccountsForNetwork(
  selectedNetwork: NetworkInfo,
  thisWeb3Enable: typeof web3Enable,
  thisWeb3Accounts: typeof web3Accounts,
  apiPromise: ApiPromise
): Promise<void> {
  console.log('fetchAccountsForNetwork() - ', selectedNetwork);

  const providerAccounts: Map<string, Account> = new Map<string, Account>();
  const nonProviderAccounts: Map<string, Account> = new Map<string, Account>();

  // If the network is localhost, add the default test accounts for the chain
  if (selectedNetwork.name === 'LOCALHOST') {
    const keyring = new Keyring({ type: 'sr25519' });

    await Promise.all(
      ['//Alice', '//Bob', '//Charlie', '//Dave', '//Eve', '//Ferdie'].map(async (accountName) => {
        const keyRingPair = { ...keyring.addFromUri(accountName), ...{ meta: { name: accountName } } };
        const account = new Account();
        account.network = selectedNetwork;
        account.address = keyRingPair.address;
        const msaInfo: MsaInfo = await getMsaInfo(apiPromise, account.address);
        account.msaId = msaInfo.msaId;
        account.signingKey = keyRingPair;
        account.isProvider = msaInfo.isProvider;
        account.providerName = providerNameToHuman(msaInfo.providerName);
        if (account.isProvider) {
          providerAccounts.set(account.address, account);
        } else {
          nonProviderAccounts.set(account.address, account);
        }
      })
    );
  }
  // Check if the Polkadot{.js} wallet extension is installed.
  if (isFunction(thisWeb3Accounts) && isFunction(thisWeb3Enable)) {
    const extensions = await thisWeb3Enable('Frequency parachain provider dashboard');
    if (!extensions || !extensions.length) {
      alert('Polkadot{.js} extension not found; please install it first.');
      throw new Error('Polkadot{.js} extension not found; please install it first.');
    }

    // If so, add the wallet accounts for the selected network (chain)
    const walletAccounts = await thisWeb3Accounts();
    await Promise.all(
      walletAccounts.map(async (walletAccount: InjectedAccountWithMeta) => {
        // include only the accounts allowed for this chain
        if (!walletAccount.meta.genesisHash || selectedNetwork.genesisHash === walletAccount.meta.genesisHash) {
          const account = new Account();
          account.network = selectedNetwork;
          account.address = walletAccount.address;
          account.signingKey = walletAccount;
          const msaInfo: MsaInfo = await getMsaInfo(apiPromise, account.address);
          account.msaId = msaInfo.msaId;
          account.isProvider = msaInfo.isProvider;
          account.providerName = providerNameToHuman(msaInfo.providerName);
          if (account.isProvider) {
            providerAccounts.set(account.address, account);
          } else {
            nonProviderAccounts.set(account.address, account);
          }
        }
      })
    );
  }

  providerAccountsStore.set(providerAccounts);
  nonProviderAccountsStore.set(nonProviderAccounts);
}
