import { derived, writable, type Readable } from 'svelte/store';
import { Keyring, type ApiPromise } from '@polkadot/api';
import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { getMsaInfo } from '$lib/polkadotApi';
import { isFunction } from '@polkadot/util';
import type { NetworkInfo } from '$lib/stores/networksStore';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { MsaInfo } from '$lib/storeTypes';
import { providerNameToHuman } from '$lib/utils';
import type { KeyringPair } from '@polkadot/keyring/types';

export type SS58Address = string;

export class Account {
  network?: NetworkInfo;
  address: SS58Address = '';
  keyringPair?: KeyringPair;
  injectedAccount?: InjectedAccountWithMeta;
  msaId?: number;
  isProvider: boolean = false;
  providerName?: string;
  display?: string;

  constructor() {
    this.address = '';
  }
}

export type Accounts = Map<SS58Address, Readonly<Account>>;

// Helper functions to filter all accounts to just the accounts for that store
const isProvider = ([_key, account]: [string, Account]) => account.isProvider;
const isNotProviderMsa = ([_key, account]: [string, Account]) => !account.isProvider;
const isUnused = ([_key, account]: [string, Account]) => !account.isProvider && !account.msaId;

// Stores all accounts
export const allAccountsStore = writable<Accounts>(new Map<SS58Address, Readonly<Account>>());
// Filtered down to just provider accounts
export const providerAccountsStore = derived<Readable<Accounts>, Accounts>(allAccountsStore, (all, setFn) => {
  setFn(new Map([...all.entries()].filter(isProvider)));
});
// These accounts don't even have an MSA
export const unusedKeyAccountsStore = derived<Readable<Accounts>, Accounts>(allAccountsStore, (all, setFn) => {
  setFn(new Map([...all.entries()].filter(isUnused)));
});
// These accounts have an MSA, but are not a provider
export const nonProviderAccountsStore = derived<Readable<Accounts>, Accounts>(allAccountsStore, (all, setFn) => {
  setFn(new Map([...all.entries()].filter(isNotProviderMsa)));
});

export async function fetchAccountsForNetwork(
  selectedNetwork: NetworkInfo,
  thisWeb3Enable: typeof web3Enable,
  thisWeb3Accounts: typeof web3Accounts,
  apiPromise: ApiPromise
): Promise<void> {
  console.log('fetchAccountsForNetwork() - ', selectedNetwork);

  const allAccounts: Accounts = new Map<SS58Address, Account>();

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
        account.keyringPair = keyRingPair;
        account.isProvider = msaInfo.isProvider;
        account.providerName = providerNameToHuman(msaInfo.providerName);
        account.display = accountName;
        allAccounts.set(account.address, account);
      })
    );
  }
  try {
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
            account.injectedAccount = walletAccount;
            const msaInfo: MsaInfo = await getMsaInfo(apiPromise, account.address);
            account.msaId = msaInfo.msaId;
            account.isProvider = msaInfo.isProvider;
            account.providerName = providerNameToHuman(msaInfo.providerName);
            account.display = walletAccount.meta.name;
            allAccounts.set(account.address, account);
          }
        })
      );
    }
  } catch (e) {
    console.error('Unable to load extension accounts', e);
  }
  allAccountsStore.set(allAccounts);
}
