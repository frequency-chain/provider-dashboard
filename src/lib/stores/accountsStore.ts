import { getMsaInfo, type AccountBalances } from '$lib/polkadotApi';
import { NetworkType, type NetworkInfo } from '$lib/stores/networksStore';
import type { MsaInfo } from '$lib/storeTypes';
import { providerNameToHuman, refreshAllBalances } from '$lib/utils';
import { Keyring, type ApiPromise } from '@polkadot/api';
import { web3Accounts, type web3Enable } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import { isFunction } from '@polkadot/util';
import { derived, writable, type Readable } from 'svelte/store';

export type SS58Address = string;

export class Account {
  address: SS58Address = '';
  isProvider: boolean = false;
  balances: AccountBalances = { transferable: 0n, locked: 0n, total: 0n };
  network?: NetworkInfo;
  keyringPair?: KeyringPair;
  injectedAccount?: InjectedAccountWithMeta;
  msaId?: number;
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

// Checks for wallet/extension
export const hasExtension = writable<boolean | null>(null);

export async function fetchAccountsForNetwork(
  selectedNetwork: NetworkInfo,
  thisWeb3Enable: typeof web3Enable,
  thisWeb3Accounts: typeof web3Accounts,
  apiPromise: ApiPromise
): Promise<void> {
  const allAccounts: Accounts = new Map<SS58Address, Account>();

  if (selectedNetwork.id === NetworkType.LOCALHOST) {
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
    if (isFunction(thisWeb3Accounts) && isFunction(thisWeb3Enable)) {
      const extensions = await thisWeb3Enable('Frequency parachain provider dashboard');
      const extensionCheck = !!extensions && !!extensions.length;
      hasExtension.set(extensionCheck);
      // If no wallet extension found, throw error.
      if (!extensionCheck) throw new Error('Polkadot{.js} extension not found; please install it first.');

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

  // trigger initial balance fetch
  if (apiPromise) {
    await refreshAllBalances(apiPromise, allAccounts);
  }
}
