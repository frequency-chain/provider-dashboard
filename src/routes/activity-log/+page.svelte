<script lang="ts">
  import ActivityLogPreviewItem from '../../components/ActivityLogPreviewItem.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import BlockSection from '$components/BlockSection.svelte';
  import type { Activity } from '$lib/storeTypes';

  let activityItems: Activity[] = $derived($activityLog);
</script>

<BlockSection title="Activity Log">
  <div class="min-w-[500px]">
    {#if activityItems.length > 0}
      {#each activityItems as activity (activity.txnId)}
        <ActivityLogPreviewItem {activity} />
      {/each}
    {:else}
      <div class="py-2 text-sm">No activity.</div>
    {/if}
  </div>
</BlockSection>
