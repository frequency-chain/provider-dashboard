<script lang="ts">
  import {
    storeConnected,
    transactionSigningAddress,
    dotApi,
    storeMsaInfo,
    storeBlockNumber,
    storeChainInfo,
  } from '$lib/stores';
  import { getBlockNumber } from '$lib/connections';
  import type { ApiPromise } from '@polkadot/api';
  import type { ChainInfo, MsaInfo } from '$lib/storeTypes';
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
      storeChainInfo.update((info: ChainInfo) => (info = { ...info, epochNumber }));
      storeMsaInfo.set(msaInfo);
    }
  });
</script>

<div class="p-14 ml-8 w-500 action-card font-semibold tracking-wider bg-gradient-to-br">
  <p class="text-2xl pb-6">Capacity</p>
  {#if !connected}
    <p>Not connected</p>
  {:else if msaInfo.isProvider}
    <table>
      <tr>
        <td>Remaining:</td>
        <td class="pl-4 font-light">{balanceToHuman(capacityDetails?.remainingCapacity, 'CAP')}</td>
      </tr>
      <tr>
        <td>Total Issued: </td>
        <td class="pl-4 font-light">{balanceToHuman(capacityDetails?.totalCapacityIssued, 'CAP')}</td>
      </tr>
      <tr>
        <td>Last Replenished:</td>
        <td class="pl-4 font-light">Epoch {capacityDetails?.lastReplenishedEpoch}</td>
      </tr>
      <tr>
        <td>Staked Token: </td>
        <td class="pl-4 font-light">{balanceToHuman(capacityDetails?.totalCapacityIssued, token)}</td>
      </tr>
    </table>
  {:else if signingAddress == ''}
    <p>No transaction signing address selected</p>
  {:else}
    <p>Not a provider</p>
  {/if}
</div>
