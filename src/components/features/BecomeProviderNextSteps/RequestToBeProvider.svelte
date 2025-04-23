<script lang="ts">
  import { dotApi } from '$lib/stores';
  import { submitRequestToBeProvider } from '$lib/connections';
  import type { Activity } from '$lib/storeTypes';
  import { type MsaInfo, TxnStatus } from '$lib/storeTypes';
  import { createMailto, getExtension, providerNameToHuman } from '$lib/utils';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import BackHomeButton from '$atoms/BackHomeButton.svelte';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import { getMsaInfo } from '$lib/polkadotApi';
  import ActivityLogPreviewItem from '$features/ActivityLogItem/ActivityLogItem.svelte';

  let { hasRequestedToBeProvider = $bindable(), ...props } = $props();

  let isInProgress = $state(false);
  let recentActivityItem: Activity | undefined = $state();
  let recentTxnId: Activity['txnId'] | undefined = $state();
  let newProviderName = $state('');
  let mailTo = createMailto('hello@frequency.xyz', 'Request to be a Provider', '');

  // a callback for when a transaction hits a final state
  let requestToBeProviderTxnFinished = async (succeeded: boolean) => {
    if (succeeded) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const msaInfo: MsaInfo = await getMsaInfo($dotApi.api!, $user.address);
      $user.providerName = providerNameToHuman(msaInfo.providerName);
      $user.isProvider = msaInfo.isProvider;
      isInProgress = false;
      hasRequestedToBeProvider = true;
    }
  };

  const checkIsFinished = async () => {
    if (recentActivityItem && recentActivityItem.txnStatus !== TxnStatus.LOADING) {
      await requestToBeProviderTxnFinished(recentActivityItem.txnStatus === TxnStatus.SUCCESS);
      if (recentActivityItem.txnStatus === TxnStatus.FAILURE) isInProgress = false;
    }
  };

  $effect(() => {
    recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
    queueMicrotask(checkIsFinished);
  });

  const doProposeToBeProvider = async (_evt: Event) => {
    if (!$dotApi.api) {
      alert('please reconnect to an endpoint');
      return;
    }
    isInProgress = true;
    recentTxnId = await submitRequestToBeProvider($dotApi.api, await getExtension($user), $user, newProviderName);
    recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
  };
</script>

<div id="request-to-be-provider" class="column">
  {#if hasRequestedToBeProvider === false}
    <form class="column">
      <div>
        <label for="providerNameRtB" class="label mb-3.5 block">Provider name</label>
        <input id="providerNameRtB" required placeholder="Short name" maxlength={16} bind:value={newProviderName} />
      </div>
      <div class="flex w-[350px] justify-between">
        <button
          onclick={doProposeToBeProvider}
          disabled={newProviderName === '' || isInProgress}
          id="request-2b-provider-btn"
          class="btn-primary"
        >
          {#if isInProgress}
            <LoadingIcon />
          {:else}
            Request To Be Provider
          {/if}
        </button>
        <BackHomeButton />
      </div>
    </form>
  {:else}
    <p class="text-sm font-bold">Success! Your request to become a provider has been submitted.</p>
    <ul class="truncate text-sm">
      <li>Provider Name: <b>{newProviderName}</b></li>
      <li>Address: <b>{$user.address}</b></li>
      <li>MSA ID: <b>{$user.msaId}</b></li>
    </ul>
    <p class="text-sm">
      <a href={mailTo} class="font-bold underline">Contact the Frequency Council </a>
      and inform them that you have requested to become a Provider, and provide them with your MSA Id.
    </p>
    <BackHomeButton />
  {/if}

  {#if recentActivityItem && recentActivityItem.txnStatus === TxnStatus.FAILURE}
    <p class="text-sm font-bold">
      Your request to has failed. This may be because you have previously submitted a request to become a provider.
    </p>
  {/if}
</div>

{#if recentActivityItem}
  <ActivityLogPreviewItem activity={recentActivityItem} />
{/if}
