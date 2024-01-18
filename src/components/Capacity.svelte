<script lang="ts">
  import {
    storeConnected,
    transactionSigningAddress,
    dotApi,
    storeMsaInfo,
    storeBlockNumber,
    storeChainInfo,
    storeCurrentAction,
  } from '$lib/stores';
  import { getBlockNumber } from '$lib/connections';
  import type { ApiPromise } from '@polkadot/api';
  import type { ChainInfo, MsaInfo } from '$lib/storeTypes';
  import { getMsaEpochAndCapacityInfo } from '$lib/polkadotApi';
  import { providerNameToHuman } from '$lib/utils';
  import { balanceToHuman } from '$lib/utils.js';
  import ListCard from './ListCard.svelte';
  import { ActionForms } from '$lib/storeTypes.js';

  let signingAddress = ''; // eslint-disable-line no-unused-vars
  let epochNumber = 0n;
  let connected: boolean;
  storeConnected.subscribe((val) => (connected = val));

  let msaInfo: MsaInfo = { isProvider: false, msaId: 0, providerName: '' };
  storeMsaInfo.subscribe((info) => {
    msaInfo = info as MsaInfo;
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

  export let token = '';

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

  function showStake() {
    storeCurrentAction.update((val) => (val = ActionForms.Stake));
  }

  $: capacityList = [
    { label: 'Remaining', value: balanceToHuman(capacityDetails?.remainingCapacity, 'CAP') },
    { label: 'Total Issued', value: balanceToHuman(capacityDetails?.totalCapacityIssued, 'CAP') },
    { label: 'Last Replenished', value: `Epoch ${capacityDetails?.lastReplenishedEpoch}` },
    { label: 'Staked Token', value: balanceToHuman(capacityDetails?.totalCapacityIssued, token) },
  ];
</script>

<ListCard title="Capacity" list={capacityList} {connected} {msaInfo} {signingAddress}>
  <button on:click={showStake} class="btn-primary">Stake To Provider</button>
</ListCard>
