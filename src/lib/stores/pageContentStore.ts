import { writable, type Writable } from 'svelte/store';

export enum PageContent {
    Dashboard = 'dashboard',
    Login = 'login',
    BecomeProvider = 'becomeProvider',
    Reconnect = 'reconnect',
  }
  
  const createPageContentStore = () => {
    const { subscribe, set } = writable(PageContent.Login);
  
    return {
      subscribe,
      set,
      login: () => set(PageContent.Login),
      becomeProvider: () => set(PageContent.BecomeProvider),
      dashboard: () => set(PageContent.Dashboard),
      reconnect: () => set(PageContent.Reconnect),
    };
  };
  
  export const pageContent = createPageContentStore();