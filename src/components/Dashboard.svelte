<script lang="ts">
  import Capacity from '$components/Capacity.svelte';
  import Provider from '$components/Provider.svelte';
  import DashboardHeader from '$components/DashboardHeader.svelte';
  import ChainStatus from '$components/ChainStatus.svelte';
</script>

<div class="max-w-dashboard column w-full">
  <DashboardHeader />

  <ChainStatus />

  <div class="flex justify-center gap-4">
    <Provider />
    <Capacity />
  </div>
</div>
