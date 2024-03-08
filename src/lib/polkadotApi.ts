import type { ApiPromise } from '@polkadot/api';

import type { MsaInfo } from '$lib/storeTypes';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { ChainProperties } from '@polkadot/types/interfaces';
import type { Option, u64 } from '@polkadot/types';

export type AccountMap = Record<string, KeyringPair>;

export function getToken(chain: ChainProperties) {
  const rawUnit = chain.tokenSymbol.toString();
  return rawUnit.slice(1, rawUnit.length - 1);
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

export async function getMsaInfo(apiPromise: ApiPromise, publicKey: string): Promise<MsaInfo> {
  const received: u64 = (await apiPromise?.query.msa.publicKeyToMsaId(publicKey))?.unwrapOrDefault();
  const msaInfo: MsaInfo = { isProvider: false, msaId: 0, providerName: '' };
  msaInfo.msaId = received?.toNumber();
  if (msaInfo.msaId > 0) {
    const providerRegistry: Option<any> = await apiPromise.query.msa.providerToRegistryEntry(msaInfo.msaId);
    if (providerRegistry.isSome) {
      msaInfo.isProvider = true;
      const registryEntry = providerRegistry.unwrap();
      msaInfo.providerName = registryEntry.providerName;
    }
  }
  return msaInfo;
}

export type CapacityDetails = {
  remainingCapacity: bigint;
  totalTokensStaked: bigint;
  totalCapacityIssued: bigint;
  lastReplenishedEpoch: bigint;
};

export async function getCapacityInfo(apiPromise: ApiPromise, msaId: number): Promise<CapacityDetails> {
  let capacityDetails: CapacityDetails = {
    remainingCapacity: 0n,
    totalCapacityIssued: 0n,
    totalTokensStaked: 0n,
    lastReplenishedEpoch: 0n,
  };

  const providerRegistry: Option<any> = await apiPromise.query.msa.providerToRegistryEntry(msaId);

  if (providerRegistry.isSome) {
    const details: any = (await apiPromise.query.capacity.capacityLedger(msaId)).unwrapOrDefault();
    capacityDetails = {
      remainingCapacity: details.remainingCapacity.toBigInt(),
      totalTokensStaked: details.totalTokensStaked.toBigInt(),
      totalCapacityIssued: details.totalCapacityIssued.toBigInt(),
      lastReplenishedEpoch: details.lastReplenishedEpoch.toBigInt(),
    };
  }

  return capacityDetails;
}
