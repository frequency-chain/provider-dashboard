<script lang="ts">
  import SuccessIcon from '$lib/assets/SuccessIcon.svelte';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import FailureIcon from '$lib/assets/FailureIcon.svelte';
  import { TxnStatus, type Activity } from '$lib/storeTypes';

  interface Props {
    activity: Activity;
  }

  let { activity }: Props = $props();
</script>

<div class="break-anywhere flex gap-2 text-wrap border-b border-divider py-2 text-sm">
  {#if activity.txnStatus === TxnStatus.LOADING}
    <LoadingIcon />
  {:else if activity.txnStatus === TxnStatus.SUCCESS}
    <SuccessIcon />
  {:else if activity.txnStatus === TxnStatus.FAILURE}
    <FailureIcon />
  {/if}

  <div class="break-['break-word']">
    <div>Hash: {activity.txnId}</div>
    <ul class="unordered-list text-sm">
      {#each activity.txnStatusItems as item}
        <li>{item}</li>
      {/each}
    </ul>
  </div>
</div>
