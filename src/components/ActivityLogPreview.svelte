<script lang="ts">
  import ActivityLogPreviewItem from './ActivityLogPreviewItem.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import type { GenericEvent } from '@polkadot/types';
  console.log($activityLog);

  let activityItems: GenericEvent[];

  $: {
    activityItems = $activityLog;
  }
</script>

<!-- TODO: Connect activities -->
<div>
  <!-- <div class="min-w-[300px] border-l border-divider pl-5">
  <div class="label border-b border-divider pb-5">Activity Log</div>
  <div class="border-b border-divider py-2 text-sm">Activity_Log_Preview</div>
</div> -->
  {#if activityItems}
    {#each activityItems as activity}
      <ActivityLogPreviewItem>{activity.method}</ActivityLogPreviewItem>
    {/each}
  {:else}
    <div>No activity.</div>
  {/if}
</div>
