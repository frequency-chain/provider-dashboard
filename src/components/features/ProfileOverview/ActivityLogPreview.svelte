<script lang="ts">
  import ActivityLogPreviewItem from '../ActivityLogItem/ActivityLogItem.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import type { Activity } from '$lib/storeTypes';
  import { Button } from '@frequency-chain/style-guide';

  let recentActivityItem: Activity = $derived($activityLog[0]);
</script>

<div class="flex flex-col">
  <div class="border-divider border-l pl-5 md:min-w-[300px]"></div>
  <div class="mdText border-divider border-b pb-3 font-bold">Activity Log</div>

  {#if recentActivityItem}
    <ActivityLogPreviewItem activity={recentActivityItem} />
    <Button href="/activity-log" class="mt-4 self-end">See all activity</Button>
  {:else}
    <div class="smText py-2">No activity.</div>
  {/if}
</div>
