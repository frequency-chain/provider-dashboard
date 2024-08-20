import { writable } from 'svelte/store';
import { defaultDotApi, type DotApi } from '$lib/storeTypes';
import { storable } from './stores/storable';
import { derived } from 'svelte/store';
import { user } from './stores/userStore';
import { pageContent } from './stores/pageContentStore';
import { clearLog } from './stores/activityLogStore';
import { createApi } from './polkadotApi';

export const dotApi = writable<DotApi>(defaultDotApi);

export const isLoggedIn = storable<boolean>('isLoggedIn', false);

export const logInPromise = derived([user], ([$user]) =>
  (async () => {
    if ($user?.network?.endpoint) {
      dotApi.set(await createApi($user?.network?.endpoint));
      if ($user.isProvider) {
        isLoggedIn.set(true);
        pageContent.dashboard();
      }
    }
  })()
);

export const logout = () => {
  isLoggedIn.set(false);
  user.set({ address: '', isProvider: false });
  dotApi.set(defaultDotApi);
  storeChainInfo.set({ connected: false, blockNumber: 0n, epochNumber: 0n, token: '' });
  pageContent.login();
  clearLog();
};

export const storeChainInfo = storable('storeChainInfo', {
  connected: false,
  blockNumber: 0n,
  epochNumber: 0n,
  token: '',
});
