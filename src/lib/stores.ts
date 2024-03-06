import { writable } from 'svelte/store';
import { defaultDotApi, type DotApi } from '$lib/storeTypes';
import { storable } from './stores/storable';
import { derived } from 'svelte/store';
import { user } from './stores/userStore';
import { createApi } from './polkadotApi';
import { pageContent } from './stores/pageContentStore';

export const dotApi = writable<DotApi>(defaultDotApi);

export const isLoggedIn = storable<boolean>('isLoggedIn', false);

export const logInPromise = derived([user], ([$user]) =>
  (async () => {
    if ($user?.network?.endpoint) {
      dotApi.set(await createApi($user?.network?.endpoint));
      isLoggedIn.set(true);
      if ($user.isProvider) {
        pageContent.dashboard();
      }
    }
  })()
);

export const logout = () => {
  isLoggedIn.update((value) => (value = false));
  user.set({ address: '', isProvider: false });
  dotApi.set(defaultDotApi);
  storeChainInfo.set({ connected: false, blockNumber: 0n, epochNumber: 0n, token: '' });
  pageContent.login();
};

export const storeChainInfo = storable('storeChainInfo', {
  connected: false,
  blockNumber: 0n,
  epochNumber: 0n,
  token: '',
});
