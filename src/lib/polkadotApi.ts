import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { getBlockNumber, getEpoch } from './connections';
import { dotApi, storeBlockNumber, storeConnected, storeToken } from './stores';
import { options } from '@frequency-chain/api-augment';

import type { DotApi, MsaInfo } from '$lib/storeTypes';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { ChainProperties } from '@polkadot/types/interfaces';
import type { Option, u64 } from '@polkadot/types';

export type AccountMap = Record<string, KeyringPair>;

export async function getApi(selectedProviderURI: string, thisDotApi: DotApi, wsProvider: WsProvider) {
  if (!selectedProviderURI) {
    throw new Error('Empty providerURI');
  }
  // Handle disconnects
  if (selectedProviderURI) {
    if (thisDotApi?.api) {
      await thisDotApi.api.disconnect();
    } else if (wsProvider) {
      await wsProvider.disconnect();
    }
  }

  // Singleton Provider because it starts trying to connect here.
  wsProvider = new WsProvider(selectedProviderURI);
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
    selectedEndpoint: selectedProviderURI,
    options,
  };
  dotApi.update((currentApi) => (currentApi = initializedDotApi));
}

export function getToken(chain: ChainProperties) {
  const rawUnit = chain.tokenSymbol.toString();
  return rawUnit.slice(1, rawUnit.length - 1);
}

export async function updateConnectionStatus(apiPromise: ApiPromise) {
  const chain = await apiPromise.rpc.system.properties();
  const token = getToken(chain);
  const blockNumber = (await getBlockNumber(apiPromise)) as bigint;
  storeConnected.update((val) => (val = apiPromise.isConnected));
  storeToken.update((val) => (val = token));
  storeBlockNumber.update((val) => (val = blockNumber));
}

export type AccountBalances = {
  free: bigint;
  frozen: bigint;
  reserved: bigint;
};
export async function getBalances(apiPromise: ApiPromise, accountId: string): Promise<AccountBalances> {
  const accountData = (await apiPromise.query.system.account(accountId)).data;
  return {
    free: accountData.free.toBigInt(),
    frozen: accountData.frozen.toBigInt(),
    reserved: accountData.reserved.toBigInt(),
  };
}

export async function getProviderFromMsa(apiPromise: ApiPromise, msaId: number): Promise<any | undefined> {
  const providerRegistry: Option<any> = await apiPromise.query.msa.providerToRegistryEntry(msaId);
  if (providerRegistry.isSome) return providerRegistry.unwrap();
}

export async function getMsaInfo(apiPromise: ApiPromise, publicKey: string): Promise<MsaInfo> {
  const received: u64 = (await apiPromise.query.msa.publicKeyToMsaId(publicKey)).unwrapOrDefault();

  const msaInfo: MsaInfo = { isProvider: false, msaId: 0, providerName: '' };
  msaInfo.msaId = received.toNumber();
  if (msaInfo.msaId > 0) {
    const provider = await getProviderFromMsa(apiPromise, msaInfo.msaId);
    if (provider) {
      msaInfo.isProvider = true;
      msaInfo.providerName = provider.providerName;
    }
  }
  return msaInfo;
}

export async function getMsaEpochAndCapacityInfo(
  apiPromise: ApiPromise,
  accountId: string
): Promise<{ epochNumber: bigint; msaInfo: MsaInfo; capacityDetails: any }> {
  const msaInfo = await getMsaInfo(apiPromise, accountId);
  const epochNumber = await getEpoch(apiPromise);
  let capacityDetails;
  if (msaInfo.msaId > 0) {
    const providerRegistry: Option<any> = await apiPromise.query.msa.providerToRegistryEntry(msaInfo.msaId);
    if (providerRegistry.isSome) {
      const details: any = (await apiPromise.query.capacity.capacityLedger(msaInfo.msaId)).unwrapOrDefault();
      capacityDetails = {
        remainingCapacity: details.remainingCapacity.toBigInt(),
        totalTokensStaked: details.totalTokensStaked.toBigInt(),
        totalCapacityIssued: details.totalCapacityIssued.toBigInt(),
        lastReplenishedEpoch: details.lastReplenishedEpoch.toBigInt(),
      };
    }
  }
  return { msaInfo, epochNumber, capacityDetails };
}
