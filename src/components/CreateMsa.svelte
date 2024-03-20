<script lang="ts">
  import { dotApi } from '$lib/stores';
  import { TxnStatus, type Activity, type MsaInfo } from '$lib/storeTypes';
  import type { ApiPromise } from '@polkadot/api';
  import { getExtension } from '$lib/utils';
  import { submitCreateMsa } from '$lib/connections';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import { pageContent } from '$lib/stores/pageContentStore';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import ActivityLogPreviewItem from './ActivityLogPreviewItem.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';

  // a callback for when the user cancels this action
  export let cancelAction = () => {
    pageContent.login();
  };

  let recentActivityItem: Activity | undefined;
  let recentTxnId: Activity['txnId'] | undefined;
  let isInProgress = false;

  // a callback for when a transaction hits a final state
  let createMsaTxnFinished = async (succeeded: boolean) => {
    if (succeeded) {
      const apiPromise = $dotApi.api as ApiPromise;
      const msaInfo: MsaInfo = await getMsaInfo(apiPromise, $user.address);
      isInProgress = false;
      setTimeout(() => {
        $user.msaId = msaInfo.msaId;
      }, 1500);
      return;
    }
    isInProgress = false;
  };

  const checkIsFinished = async () => {
    if (recentActivityItem && recentActivityItem.txnStatus !== TxnStatus.LOADING) {
      await createMsaTxnFinished(recentActivityItem.txnStatus === TxnStatus.SUCCESS);
    }
  };

  $: {
    recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
    checkIsFinished();
  }

  const doCreateMsa = async (_evt: Event) => {
    isInProgress = true;
    recentTxnId = await submitCreateMsa($dotApi.api, await getExtension($user), $user);
    recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
  };
</script>

<div id="create-msa" class="flex flex-col gap-3.5 text-sm">
  <div class="label">Create MSA Id</div>
  <p>
    An MSA (Message Source Account) is required to become a provider. This action will create an MSA Id that is
    controlled by the selected Transaction Signing Address above. It is available only on Frequency Testnet.
  </p>
  <form class="flex w-[350px] items-end justify-between">
    <button id="create-msa-btn" on:click|preventDefault={doCreateMsa} disabled={isInProgress} class="btn-primary">
      {#if isInProgress}
        <LoadingIcon />
      {:else}
        Create an MSA
      {/if}
    </button>
    <button on:click|preventDefault={cancelAction} class="btn-no-fill">Cancel</button>
  </form>
</div>
{#if recentActivityItem}
  <ActivityLogPreviewItem activity={recentActivityItem} />
{/if}
