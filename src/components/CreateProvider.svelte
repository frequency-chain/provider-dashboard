<script lang="ts">
  import { dotApi } from '$lib/stores';
  import { getExtension, providerNameToHuman } from '$lib/utils';
  import { submitCreateProvider } from '$lib/connections';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import { TxnStatus, type Activity, type MsaInfo } from '$lib/storeTypes';
  import { pageContent } from '$lib/stores/pageContentStore';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import ActivityLogPreviewItem from './ActivityLogPreviewItem.svelte';

  // a callback for when a transaction hits a final state
  let createProviderTxnFinished = async (succeeded: boolean) => {
    if (succeeded) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const msaInfo: MsaInfo = await getMsaInfo($dotApi.api!, $user.address);
      $user.providerName = providerNameToHuman(msaInfo.providerName);
      $user.isProvider = msaInfo.isProvider;
      isInProgress = false;
      setTimeout(() => {
        pageContent.dashboard();
      }, 1500);
    }
  };

  let newProviderName = '';
  let isInProgress = false;
  let recentActivityItem: Activity | undefined;
  let recentTxnId: Activity['txnId'] | undefined;

  const checkIsFinished = async () => {
    if (recentActivityItem && recentActivityItem.txnStatus !== TxnStatus.LOADING) {
      await createProviderTxnFinished(recentActivityItem.txnStatus === TxnStatus.SUCCESS);
    }
  };

  $: {
    recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
    checkIsFinished();
  }

  const doCreateProvider = async (_evt: Event) => {
    const endpointURI: string | undefined = $user.network?.endpoint;
    if (!endpointURI) {
      alert('Error connecting to endpoint.');
      return;
    }
    if (newProviderName === '') {
      alert('please enter a Provider Name');
      return;
    }
    if (!$dotApi.api) {
      alert('please reconnect to an endpoint');
      return;
    }
    isInProgress = true;
    recentTxnId = await submitCreateProvider($dotApi.api, await getExtension($user), $user, newProviderName);
    recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
  };
</script>

<form id="create-provider" class="column text-sm">
  <div>
    <label for="providerNameCB" class="label mb-3.5 block">Provider name</label>
    <input id="providerNameCB" required placeholder="Short name" maxlength={16} bind:value={newProviderName} />
  </div>
  <div class="flex w-[350px] items-end justify-between">
    <button
      id="create-provider-btn"
      on:click|preventDefault={doCreateProvider}
      disabled={isInProgress}
      class="btn-primary"
    >
      {#if isInProgress}
        <LoadingIcon />
      {:else}
        Create Provider
      {/if}
    </button>
    <a href="/" class="btn-no-fill">Cancel</a>
  </div>
</form>
{#if recentActivityItem}
  <ActivityLogPreviewItem activity={recentActivityItem} />
{/if}
