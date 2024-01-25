import { writable, type Writable } from 'svelte/store';

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
