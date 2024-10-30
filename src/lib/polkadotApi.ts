import type { MsaInfo } from '$lib/storeTypes';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { ChainProperties } from '@polkadot/types/interfaces';
import type { DotApi } from '$lib/storeTypes';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { options } from '@frequency-chain/api-augment';

export type AccountMap = Record<string, KeyringPair>;

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

export function getToken(chain: ChainProperties) {
  const rawUnit = chain.tokenSymbol.toString();
  return rawUnit.slice(1, rawUnit.length - 1);
}

export interface AccountBalances {
  transferable: bigint;
  locked: bigint;
  total: bigint;
}
export async function getBalances(apiPromise: ApiPromise, accountId: string): Promise<AccountBalances> {
  const accountData = (await apiPromise.query.system.account(accountId)).data;
  const free = accountData.free.toBigInt();
  const locked = accountData.frozen.toBigInt();
  const transferable = free - locked;
  const total = free + accountData.reserved.toBigInt();
  return {
    transferable,
    locked,
    total,
  };
}

export async function getMsaInfo(apiPromise: ApiPromise, publicKey: string): Promise<MsaInfo> {
  const received = (await apiPromise?.query.msa.publicKeyToMsaId(publicKey))?.unwrapOrDefault();
  const msaInfo: MsaInfo = { isProvider: false, msaId: 0, providerName: '' };
  msaInfo.msaId = received?.toNumber();
  if (msaInfo.msaId > 0) {
    const providerRegistry = await apiPromise.query.msa.providerToRegistryEntry(msaInfo.msaId);
    if (providerRegistry.isSome) {
      msaInfo.isProvider = true;
      const registryEntry = providerRegistry.unwrap();
      msaInfo.providerName = registryEntry.providerName.toString();
    }
  }
  return msaInfo;
}

export interface CapacityDetails {
  remainingCapacity: bigint;
  totalTokensStaked: bigint;
  totalCapacityIssued: bigint;
  lastReplenishedEpoch: bigint;
}

export async function getCapacityInfo(apiPromise: ApiPromise, msaId: number): Promise<CapacityDetails> {
  let capacityDetails: CapacityDetails = {
    remainingCapacity: 0n,
    totalCapacityIssued: 0n,
    totalTokensStaked: 0n,
    lastReplenishedEpoch: 0n,
  };

  const providerRegistry = await apiPromise.query.msa.providerToRegistryEntry(msaId);

  if (providerRegistry.isSome) {
    const details = (await apiPromise.query.capacity.capacityLedger(msaId)).unwrapOrDefault();
    capacityDetails = {
      remainingCapacity: details.remainingCapacity.toBigInt(),
      totalTokensStaked: details.totalTokensStaked.toBigInt(),
      totalCapacityIssued: details.totalCapacityIssued.toBigInt(),
      lastReplenishedEpoch: details.lastReplenishedEpoch.toBigInt(),
    };
  }

  return capacityDetails;
}
