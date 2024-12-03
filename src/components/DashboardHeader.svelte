<script lang="ts">
  import Profile from '$components/Profile.svelte';
  import ActivityLogPreview from '$components/ActivityLogPreview.svelte';
</script>

<div class="content-block flex flex-col justify-between gap-2 break-all md:gap-16 lg:flex-row">
  <Profile />
  <ActivityLogPreview />
</div>
