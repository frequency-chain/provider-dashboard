<script lang="ts">
  import ActivityLogPreviewItem from './ActivityLogPreviewItem.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import type { Activity } from '$lib/storeTypes';

  let recentActivityItem: Activity;

  $: {
    recentActivityItem = $activityLog[$activityLog.length - 1];
  }
</script>

<div class="flex flex-col">
  <div class="min-w-[300px] border-l border-divider pl-5" />
  <div class="label border-b border-divider pb-3">Activity Log</div>

  {#if recentActivityItem}
    <ActivityLogPreviewItem activity={recentActivityItem} />
    <a href="/activity-log" class="mt-4 self-end">
      <button class="btn-primary">See all activity</button>
    </a>
  {:else}
    <div class="py-2 text-sm">No activity.</div>
  {/if}
</div>
