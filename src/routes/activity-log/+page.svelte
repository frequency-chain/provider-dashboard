<script lang="ts">
  import { activityLog } from '$lib/stores/activityLogStore';
  import BlockSection from '$atoms/BlockSection.svelte';
  import type { Activity } from '$lib/storeTypes';
  import ActivityLogPreviewItem from '$features/ActivityLogItem/ActivityLogItem.svelte';

  let activityItems: Activity[] = $derived($activityLog);
</script>

<BlockSection title="Activity Log">
  <div class="min-w-[500px]">
    {#if activityItems.length > 0}
      {#each activityItems as activity}
        <ActivityLogPreviewItem {activity} />
      {/each}
    {:else}
      <div class="smText py-2">No activity.</div>
    {/if}
  </div>
</BlockSection>
