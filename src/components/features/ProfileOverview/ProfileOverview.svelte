<script lang="ts">
  import Profile from '$features/ProfileOverview/Profile.svelte';
  import ActivityLogPreview from '$features/ProfileOverview/ActivityLogPreview.svelte';
  import ConnectionStatus from '$features/ConnectionStatus/ConnectionStatus.svelte';
</script>

<div class="content-block gap-f8 flex flex-col justify-between break-all md:gap-16 lg:flex-row">
  <Profile />
  <div class="gap-f24 flex flex-col">
    <ConnectionStatus />
    <ActivityLogPreview />
  </div>
</div>
