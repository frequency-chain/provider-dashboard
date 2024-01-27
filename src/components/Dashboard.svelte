<script lang="ts">
  import Capacity from '$components/Capacity.svelte';
  import Provider from '$components/Provider.svelte';
  import DashboardHeader from '$components/DashboardHeader.svelte';
  import ChainStatus from '$components/ChainStatus.svelte';
  import { storeBlockNumber, storeChainInfo, storeConnected, storeToken } from '$lib/stores';

  let blockNumber = $storeBlockNumber;
  let epochNumber = $storeChainInfo.epochNumber;
  let connected = $storeConnected;
  let token = '';
  storeToken.subscribe((val) => (token = val));
</script>

<div class="flex flex-col gap-4">
  <DashboardHeader />

  <ChainStatus {blockNumber} {connected} {token} {epochNumber} />

  <div class="flex justify-center gap-4">
    <Provider />
    <Capacity bind:token />
  </div>
</div>
