import { writable } from 'svelte/store';
import { Keyring, type ApiPromise } from '@polkadot/api';
import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { getMsaInfo } from '$lib/polkadotApi';
import { isFunction } from '@polkadot/util';
import type { NetworkInfo } from '$lib/stores/networksStore';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { MsaInfo } from '$lib/storeTypes';
import type { SigningKey } from '$lib/connections';
import { providerNameToHuman } from '$lib/utils';

export type SS58Address = string;

export class Account {
  network?: NetworkInfo;
  address: SS58Address = '';
  signingKey?: SigningKey;
  msaId?: number;
  isProvider: boolean = false;
  providerName?: string;

  constructor() {
    this.address = '';
  }
}

export type Accounts = Map<SS58Address, Readonly<Account>>;

export const providerAccountsStore = writable<Accounts>(new Map<SS58Address, Readonly<Account>>());
export const nonProviderAccountsStore = writable<Accounts>(new Map<SS58Address, Readonly<Account>>());
export const unusedKeyAccountsStore = writable<Accounts>(new Map<SS58Address, Readonly<Account>>());

export async function fetchAccountsForNetwork(
  selectedNetwork: NetworkInfo,
  thisWeb3Enable: typeof web3Enable,
  thisWeb3Accounts: typeof web3Accounts,
  apiPromise: ApiPromise
): Promise<void> {
  console.log('fetchAccountsForNetwork() - ', selectedNetwork);

  const providerAccounts: Accounts = new Map<SS58Address, Account>();
  const nonProviderAccounts: Accounts = new Map<SS58Address, Account>();
  const unusedKeyAccounts: Accounts = new Map<SS58Address, Account>();

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
          if (account.msaId === 0) {
            unusedKeyAccounts.set(account.address, account);
          }
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
            if (account.msaId === 0) {
              unusedKeyAccounts.set(account.address, account);
            }
            nonProviderAccounts.set(account.address, account);
          }
        }
      })
    );
  }

  providerAccountsStore.set(providerAccounts);
  nonProviderAccountsStore.set(nonProviderAccounts);
  unusedKeyAccountsStore.set(unusedKeyAccounts);
}
