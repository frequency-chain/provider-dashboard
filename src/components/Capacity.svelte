<script lang="ts">
  import { storeConnected, transactionSigningAddress, dotApi, storeMsaInfo, storeBlockNumber } from '$lib/stores';
  import { getBlockNumber } from '$lib/connections';
  import type { ApiPromise } from '@polkadot/api';
  import type { MsaInfo } from '$lib/storeTypes';
  import { getMsaEpochAndCapacityInfo } from '$lib/polkadotApi';
  import { providerNameToHuman } from '$lib/utils';
  import { balanceToHuman } from '$lib/utils.js';

  let signingAddress = ''; // eslint-disable-line no-unused-vars
  let epochNumber = 0n;
  let connected;
  storeConnected.subscribe((val) => (connected = val));

  let msaInfo: MsaInfo = { isProvider: false, msaId: 0, providerName: '' };
  storeMsaInfo.subscribe((info: MsaInfo) => {
    msaInfo = info;
  });

  storeConnected.subscribe((val) => (connected = val));
  let apiPromise: ApiPromise | undefined;
  dotApi.subscribe((api) => {
    if (api?.api) {
      apiPromise = api.api;
    }
  });
  let blockNumber = 0n;
  storeBlockNumber.subscribe((val) => (blockNumber = val));

  export let token;

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

  transactionSigningAddress.subscribe(async (addr) => {
    // first set/reset all our local values.
    signingAddress = addr;
    msaInfo = { isProvider: false, msaId: 0, providerName: '' };
    if (connected && apiPromise) {
      blockNumber = await getBlockNumber(apiPromise);
      storeBlockNumber.update((val) => (val = blockNumber));
    }
    if (connected && apiPromise?.query && addr) {
      let info = await getMsaEpochAndCapacityInfo(apiPromise, addr);
      if (info?.msaInfo) {
        msaInfo.providerName = providerNameToHuman(info.msaInfo.providerName);
      }
      msaInfo.msaId = info?.msaInfo?.msaId || 0;
      msaInfo.isProvider = info?.msaInfo?.isProvider || false;
      capacityDetails = { ...defaultDetails, ...info.capacityDetails };
      epochNumber = info.epochNumber;
      storeMsaInfo.set(msaInfo);
    }
  });
</script>

<div class="pl-6 ml-6">
  <h3 class="text-aqua font-bold">Capacity</h3>
  {#if !connected}
    <p>Not connected</p>
  {:else if msaInfo.isProvider}
    <h3 class="text-aqua font-bold">As of Block {blockNumber}, Epoch {epochNumber}</h3>
    <p>Remaining: {balanceToHuman(capacityDetails?.remainingCapacity, 'CAP')}</p>
    <p>Total Issued: {balanceToHuman(capacityDetails?.totalCapacityIssued, 'CAP')}</p>
    <p>Last Replenished: Epoch {capacityDetails?.lastReplenishedEpoch}</p>
    <p>Staked Token: {balanceToHuman(capacityDetails?.totalCapacityIssued, token)}</p>
  {:else if signingAddress == ''}
    <p>No transaction signing address selected</p>
  {:else}
    <p>Not a provider</p>
  {/if}
</div>
