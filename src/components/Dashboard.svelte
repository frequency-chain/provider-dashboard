<script lang="ts">
  import Capacity from '$components/Capacity.svelte';
  import Provider from '$components/Provider.svelte';
  import DashboardHeader from '$components/DashboardHeader.svelte';
  import ChainStatus from '$components/ChainStatus.svelte';
  import { storeBlockNumber, storeChainInfo, storeToken } from '$lib/stores';

  let blockNumber = $storeBlockNumber;
  let epochNumber = $storeChainInfo.epochNumber;
  let token = $storeToken;
</script>

<div class="max-w-dashboard column w-full">
  <DashboardHeader />

  <ChainStatus {blockNumber} {token} {epochNumber} />

  <div class="flex justify-center gap-4">
    <Provider />
    <Capacity bind:token />
  </div>
</div>
