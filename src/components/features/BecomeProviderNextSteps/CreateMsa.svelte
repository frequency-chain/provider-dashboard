<script lang="ts">
  import { Button } from '@frequency-chain/style-guide';
  import { dotApi } from '$lib/stores';
  import { TxnStatus, type Activity, type MsaInfo } from '$lib/storeTypes';
  import type { ApiPromise } from '@polkadot/api';
  import { getExtension } from '$lib/utils';
  import { submitCreateMsa } from '$lib/connections';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfoForPublicKey } from '$lib/polkadotApi';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import BackToRootButton from '$atoms/BackHomeButton.svelte';
  import ActivityLogPreviewItem from '$features/ActivityLogItem/ActivityLogItem.svelte';

  interface Props {
    isLoading: boolean;
  }

  let { isLoading = $bindable(false) }: Props = $props();

  let recentActivityItem: Activity | undefined = $derived($activityLog.find((value) => value.txnId === recentTxnId));
  let recentTxnId: Activity['txnId'] | undefined = $state();
  let error: string | null = $state(null);

  // a callback for when a transaction hits a final state
  let createMsaTxnFinished = async (succeeded: boolean) => {
    if (succeeded) {
      const apiPromise = $dotApi.api as ApiPromise;
      const msaInfo: MsaInfo = await getMsaInfoForPublicKey(apiPromise, $user.address);
      isLoading = false;
      setTimeout(() => {
        user.update((curUser) => ({ ...curUser, msaId: msaInfo.msaId }));
      }, 1500);
      return;
    }
    isLoading = false;
  };

  $effect(() => {
    const checkIsFinished = async () => {
      if (recentActivityItem && recentActivityItem.txnStatus !== TxnStatus.LOADING) {
        await createMsaTxnFinished(recentActivityItem.txnStatus === TxnStatus.SUCCESS);
      }
    };

    checkIsFinished();
  });

  const doCreateMsa = async (_evt: Event) => {
    isLoading = true;
    try {
      recentTxnId = await submitCreateMsa($dotApi.api, await getExtension($user), $user);
    } catch (err) {
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };
</script>

<div id="create-msa">
  <div class="form-item-label">Create MSA Id</div>
  <p class="smText">
    An MSA (Message Source Account) is required to become a provider. This action will create an MSA Id that is
    controlled by the selected Transaction Signing Address above.
  </p>
  {#if error}<div class="text-error form-item-label">{error}</div>{/if}
  <div class="mt-f16 flex w-[350px] items-end justify-between">
    <Button onclick={doCreateMsa} disabled={isLoading}>
      {#if isLoading}
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
