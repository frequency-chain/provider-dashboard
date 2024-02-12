import { writable } from 'svelte/store';
import { defaultDotApi, type DotApi } from '$lib/storeTypes';
import { storable } from './stores/storable';
import { derived } from 'svelte/store';
import { user } from './stores/userStore';
import { createApi, getToken } from './polkadotApi';
import { getBlockNumber, getEpoch } from './connections';
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

export const storeChainInfoPromise = derived([dotApi], ([$dotApi]) =>
  (async () => {
    const chain = await $dotApi?.api?.rpc.system.properties();
    if ($dotApi?.api && chain) {
      const token = getToken(chain);
      const blockNumber = (await getBlockNumber($dotApi.api)) as bigint;
      const epochNumber = await getEpoch($dotApi.api);
      storeChainInfo.set({ connected: true, blockNumber, epochNumber, token });
    }
  })()
);
