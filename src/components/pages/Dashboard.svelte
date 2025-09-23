<script lang="ts">
  import Capacity from '$features/Capacity/Capacity.svelte';
  import Provider from '$features/Provider/Provider.svelte';
  import ProfileOverview from '$features/ProfileOverview/ProfileOverview.svelte';
  import ChainStatus from '$features/ChainStatus/ChainStatus.svelte';
</script>

<div class="max-w-dashboard column w-full" id="dashboard">
  <ProfileOverview />

  <ChainStatus />

  <div class="mx-f8 flex flex-col justify-center gap-4 lg:flex-row">
    <Provider />
    <Capacity />
  </div>
</div>
