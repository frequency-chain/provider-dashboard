<script lang="ts">
  import ActivityLogPreviewItem from './ActivityLogPreviewItem.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import type { Activity } from '$lib/storeTypes';

  let recentActivityItem: Activity = $derived($activityLog[0]);
</script>

<div class="flex flex-col">
  <div class="border-divider border-l pl-5 md:min-w-[300px]"></div>
  <div class="label border-divider border-b pb-3">Activity Log</div>

  {#if recentActivityItem}
    <ActivityLogPreviewItem activity={recentActivityItem} />
    <a href="/activity-log" class="mt-4 self-end">
      <button class="btn-primary">See all activity</button>
    </a>
  {:else}
    <div class="py-2 text-sm">No activity.</div>
  {/if}
</div>
