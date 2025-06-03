<script lang="ts">
  import { run } from 'svelte/legacy';
  import { Button } from '@frequency-chain/style-guide';
  import { dotApi } from '$lib/stores';
  import { TxnStatus, type Activity, type MsaInfo } from '$lib/storeTypes';
  import type { ApiPromise } from '@polkadot/api';
  import { getExtension } from '$lib/utils';
  import { submitCreateMsa } from '$lib/connections';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import BackToRootButton from '$atoms/BackHomeButton.svelte';
  import ActivityLogPreviewItem from '$features/ActivityLogItem/ActivityLogItem.svelte';

  let recentActivityItem: Activity | undefined = $state();
  let recentTxnId: Activity['txnId'] | undefined = $state();
  let isInProgress = $state(false);

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

  run(() => {
    recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
    checkIsFinished();
  });

  const doCreateMsa = async (_evt: Event) => {
    isInProgress = true;
    recentTxnId = await submitCreateMsa($dotApi.api, await getExtension($user), $user);
    recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
  };
</script>

<div id="create-msa" class="flex flex-col gap-3.5">
  <div class="label">Create MSA Id</div>
  <p class="smText">
    An MSA (Message Source Account) is required to become a provider. This action will create an MSA Id that is
    controlled by the selected Transaction Signing Address above.
  </p>
  <div class="flex w-[350px] items-end justify-between">
    <Button onclick={doCreateMsa} disabled={isInProgress}>
      {#if isInProgress}
        <LoadingIcon />
      {:else}
        Create an MSA
      {/if}
    </Button>
    <BackToRootButton />
  </div>
</div>
{#if recentActivityItem}
  <ActivityLogPreviewItem activity={recentActivityItem} />
{/if}
