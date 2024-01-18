import { writable, type Writable } from 'svelte/store';
import { ActionForms, defaultDotApi, type MsaInfo } from '$lib/storeTypes';

export const storeConnected = writable(false);

//All accounts
export const storeValidAccounts = writable({});
//Only provider accounts
export const storeProviderAccounts = writable({});

export const transactionSigningAddress = writable('');

export const storeMsaInfo: Writable<MsaInfo | undefined> = writable();
export const dotApi = writable(defaultDotApi);

export const storeBlockNumber = writable(0n);

export const storeCurrentAction = writable(ActionForms.NoForm);

export const storeToken = writable('');

export const storeChainInfo = writable({ connected: false, blockNumber: 0n, epochNumber: 0n, token: '' });

export enum PageContent {
  Dashboard = 'dashboard',
  Login = 'login',
  BecomeProvider = 'becomeProvider',
}

const createPageContentStore = () => {
  const { subscribe, set } = writable(PageContent.Login);

  return {
    subscribe,
    set,
    login: () => set(PageContent.Login),
    becomeProvider: () => set(PageContent.BecomeProvider),
    dashboard: () => set(PageContent.Dashboard),
  };
};

export const pageContent = createPageContentStore();