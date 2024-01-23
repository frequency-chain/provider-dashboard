<script lang="ts">
  import Capacity from '$components/Capacity.svelte';
  import Provider from '$components/Provider.svelte';
  import DashboardHeader from '$components/DashboardHeader.svelte';
  import ChainStatus from '$components/ChainStatus.svelte';
  import type { ChainInfo } from '$lib/storeTypes';

  import {
    storeBlockNumber,
    storeChainInfo,
    storeConnected,
    storeMsaInfo,
    storeToken,
    storeValidAccounts,
    transactionSigningAddress,
  } from '$lib/stores';

  const onChangeTxnSigningAddress = (evt: Event) => {
    let option = evt.target as HTMLOptionElement;
    storeMsaInfo.set({ isProvider: false, msaId: 0, providerName: '' });
    transactionSigningAddress.set(option.value);
  };

  let token = '';

  storeToken.subscribe((val) => (token = val));
  let blockNumber = 0n;
  let epochNumber = 0n;
  let connected = false;
  let validAccounts = {};

  // TODO: put all this in chainInfo and update how it's stored.
  storeBlockNumber.subscribe((val) => (blockNumber = val));
  storeConnected.subscribe((val) => (connected = val));
  storeValidAccounts.subscribe((val) => (validAccounts = val));
  storeChainInfo.subscribe((info: ChainInfo) => (epochNumber = info.epochNumber));
</script>

<div class="flex flex-col gap-4">
  <DashboardHeader />

  <ChainStatus {blockNumber} {connected} {token} {epochNumber} />

  <div class="flex justify-center gap-4">
    <Provider />
    <Capacity bind:token />
  </div>
</div>
