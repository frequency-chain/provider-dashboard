import type { DotApi, MsaInfo } from '$lib/storeTypes';
import { options } from '@frequency-chain/api-augment';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Option, u64 } from '@polkadot/types';
import type { ChainProperties } from '@polkadot/types/interfaces';
import type { PalletCapacityCapacityDetails } from '@polkadot/types/lookup';

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
export async function getBalances(apiPromise: ApiPromise, ControlKey: string): Promise<AccountBalances> {
  const accountData = ((await apiPromise.query.system.account(ControlKey)) as any).data;
  const free = accountData.free.toBigInt();
  const locked = accountData.frozen.toBigInt();
  const transferable = BigInt(free - locked);
  const total = free + accountData.reserved.toBigInt();
  return {
    transferable,
    locked,
    total,
  };
}

export async function getMsaInfoForPublicKey(apiPromise: ApiPromise, publicKey: string): Promise<MsaInfo> {
  const result = (await apiPromise?.query.msa.publicKeyToMsaId(publicKey)) as Option<u64>;
  const received = result?.unwrapOrDefault();

  return getMsaInfoById(apiPromise, received?.toNumber());
}

export async function getMsaInfoById(apiPromise: ApiPromise, msaId: number): Promise<MsaInfo> {
  const msaInfo: MsaInfo = { isProvider: false, msaId, providerName: '' };

  if (msaInfo.msaId > 0) {
    const providerRegistry = (await apiPromise.query.msa.providerToRegistryEntryV2(msaInfo.msaId)) as Option<any>;
    if (providerRegistry.isSome) {
      msaInfo.isProvider = true;
      const registryEntry = providerRegistry.unwrap();
      msaInfo.providerName = registryEntry.defaultName.toString();
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

export const defaultCapacityDetails: CapacityDetails = {
  remainingCapacity: 0n,
  totalCapacityIssued: 0n,
  totalTokensStaked: 0n,
  lastReplenishedEpoch: 0n,
};

export async function getCapacityInfo(apiPromise: ApiPromise, msaId: number): Promise<CapacityDetails> {
  const msaInfo = await getMsaInfoById(apiPromise, msaId);

  let capacityDetails = defaultCapacityDetails;

  if (msaInfo.isProvider) {
    const detailsResult = (await apiPromise.query.capacity.capacityLedger(
      msaId
    )) as Option<PalletCapacityCapacityDetails>;
    const details = detailsResult?.unwrapOrDefault();

    capacityDetails = {
      remainingCapacity: details.remainingCapacity.toBigInt(),
      totalTokensStaked: details.totalTokensStaked.toBigInt(),
      totalCapacityIssued: details.totalCapacityIssued.toBigInt(),
      lastReplenishedEpoch: details.lastReplenishedEpoch.toBigInt(),
    };
  }

  return capacityDetails;
}

export async function getControlKeys(apiPromise: ApiPromise, msaId: number): Promise<string[]> {
  const keyInfoResponse = (await (apiPromise.rpc as any).msa.getKeysByMsaId(msaId)).toHuman();
  const keys = keyInfoResponse?.msa_keys;
  if (keys) {
    console.info('Successfully found keys.', keys);
    return keys;
  }
  throw Error(`Keys not found for ${msaId}`);
}
