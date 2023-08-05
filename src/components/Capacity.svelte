<script lang="ts">
  import { storeConnected, transactionSigningAddress, dotApi, storeMsaInfo, storeBlockNumber } from '$lib/stores';
  import { u64, Option } from '@polkadot/types';
  import { getEpoch, getBlockNumber } from '$lib/connections';
  import type { ApiPromise } from '@polkadot/api';
  import {defaultMsaInfo} from "$lib/storeTypes";

  let connected;
  storeConnected.subscribe( val => connected = val);

  let msaInfo;
  storeMsaInfo.subscribe( info => msaInfo = info );

  storeConnected.subscribe((val) => (connected = val));
  let apiPromise: ApiPromise | undefined;
  dotApi.subscribe((api) => {
    if (api?.api) {
      apiPromise = api.api;
    }
  });

  type CapacityDetails = {
    remainingCapacity: bigint;
    totalTokensStaked: bigint;
    totalCapacityIssued: bigint;
    lastReplenishedEpoch: bigint;
  };
  const defaultDetails: CapacityDetails = {
    remainingCapacity: 0n,
    totalCapacityIssued: 0n,
    totalTokensStaked: 0n,
    lastReplenishedEpoch: 0n,
  };

  let capacityDetails: CapacityDetails = defaultDetails;

  let signingAddress = ''; // eslint-disable-line no-unused-vars
  let epochNumber = 0n;
  let blockNumber = 0n;
  storeBlockNumber.subscribe((val) => (blockNumber = val));

  transactionSigningAddress.subscribe(async (addr) => {
    signingAddress = addr;
    msaInfo = defaultMsaInfo;
    capacityDetails = defaultDetails;
    if (connected && apiPromise) {
      blockNumber = await getBlockNumber(apiPromise);
      storeBlockNumber.update((val) => (val = blockNumber));
    }
    if (connected && apiPromise?.query && addr) {
      const received: u64 = (await apiPromise.query.msa.publicKeyToMsaId(addr)).unwrapOrDefault();
      msaInfo.msaId = received.toNumber();
      epochNumber = await getEpoch(apiPromise);
      if (msaInfo.msaId > 0) {
        const providerRegistry: Option<any> = await apiPromise.query.msa.providerToRegistryEntry(msaInfo.msaId);
        if (providerRegistry.isSome) {
          msaInfo.isProvider = true;
          const registryEntry = providerRegistry.unwrap();
          msaInfo.providerName = registryEntry.providerName;
          const details: any = (
                  await apiPromise.query.capacity.capacityLedger(msaInfo.msaId)
          ).unwrapOrDefault();
          capacityDetails = {
            remainingCapacity: details.remainingCapacity.toBigInt(),
            totalTokensStaked: details.totalTokensStaked.toBigInt(),
            totalCapacityIssued: details.totalCapacityIssued.toBigInt(),
            lastReplenishedEpoch: details.lastReplenishedEpoch.toBigInt(),
          };
        }
        storeMsaInfo.set(msaInfo)
      }
    }
  });
  export let token;
</script>
<div class:hidden={ !msaInfo.isProvider }>
  <h3>Capacity at Block {blockNumber}, Epoch {epochNumber}</h3>
  <p>Provider name: {msaInfo.providerName}</p>
  <p><strong>Remaining:</strong> {capacityDetails.remainingCapacity}</p>
  <p><strong>Total Issued:</strong> {capacityDetails.totalCapacityIssued}</p>
  <p><strong>Last replenished:</strong> Epoch {capacityDetails.lastReplenishedEpoch}</p>
  <p><strong>Staked Token:</strong> {capacityDetails.totalCapacityIssued} {token}</p>
</div>
