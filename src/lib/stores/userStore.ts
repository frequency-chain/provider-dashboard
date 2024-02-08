import { writable } from 'svelte/store';
import { Account } from './accountsStore';
import { dotApi, isLoggedIn, storeChainInfo } from '../stores';
import { defaultDotApi } from '../storeTypes';
import { pageContent } from '../stores/pageContentStore';

export const user = writable<Account>(new Account());

export const logout = () => {
  user.set(new Account());
  dotApi.set(defaultDotApi);
  isLoggedIn.set(false);
  storeChainInfo.set({ connected: false, blockNumber: 0n, epochNumber: 0n, token: '' });
  pageContent.login();
};
