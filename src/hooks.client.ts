import type { DotApi } from '$lib/storeTypes';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { options } from '@frequency-chain/api-augment';

export async function createApi(networkEndpoint: string): Promise<DotApi> {
  const wsProvider = new WsProvider(networkEndpoint);

  const apiPromise = await ApiPromise.create({
    provider: wsProvider,
    throwOnConnect: true,
    throwOnUnknown: true,
    ...options,
  });

  await apiPromise.isReady;

  const initializedDotApi: DotApi = {
    wsProvider: wsProvider,
    api: apiPromise,
    keyring: new Keyring(),
    selectedEndpoint: networkEndpoint,
    options,
  };
  return initializedDotApi;
}
