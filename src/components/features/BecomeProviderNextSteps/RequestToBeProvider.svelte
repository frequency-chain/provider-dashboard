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
  import { Button, Input } from '@frequency-chain/style-guide';

  let { hasRequestedToBeProvider = $bindable() } = $props();

  let error: string | undefined = $state();
  let isLoading = $state(false);
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
      isLoading = false;
      hasRequestedToBeProvider = true;
    }
  };

  const checkIsFinished = async () => {
    if (recentActivityItem && recentActivityItem.txnStatus !== TxnStatus.LOADING) {
      await requestToBeProviderTxnFinished(recentActivityItem.txnStatus === TxnStatus.SUCCESS);
      if (recentActivityItem.txnStatus === TxnStatus.FAILURE) isLoading = false;
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
    isLoading = true;
    try {
      recentTxnId = await submitRequestToBeProvider($dotApi.api, await getExtension($user), $user, newProviderName);
      recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
    } catch (err) {
      error = (err as Error).message;
      isLoading = false;
    }
  };
</script>

<div id="request-to-be-provider" class="column">
  {#if hasRequestedToBeProvider === false}
    <form class="column">
      <div>
        <Input
          label="Provider name"
          id="providerNameRtB"
          placeholder="Short name"
          bind:value={newProviderName}
          oninput={() => (error = '')}
          type="text"
          required
          maxlength={16}
          {error}
          disabled={false}
        />
      </div>
      <div class="flex w-[350px] justify-between">
        <Button
          onclick={doProposeToBeProvider}
          disabled={newProviderName === '' || isLoading}
          id="request-2b-provider-btn"
        >
          {#if isLoading}
            <LoadingIcon />
          {:else}
            Request To Be Provider
          {/if}
        </Button>
        <BackHomeButton />
      </div>
    </form>
  {:else}
    <p class="smText font-bold">Success! Your request to become a provider has been submitted.</p>
    <ul class="smText truncate">
      <li>Provider Name: <b>{newProviderName}</b></li>
      <li>Address: <b>{$user.address}</b></li>
      <li>MSA ID: <b>{$user.msaId}</b></li>
    </ul>
    <p class="smText">
      <a href={mailTo} class="font-bold underline">Contact the Frequency Council </a>
      and inform them that you have requested to become a Provider, and provide them with your MSA Id.
    </p>
    <BackHomeButton />
  {/if}

  {#if recentActivityItem && recentActivityItem.txnStatus === TxnStatus.FAILURE}
    <p class="smText font-bold">
      Your request to has failed. This may be because you have previously submitted a request to become a provider.
    </p>
  {/if}
</div>

{#if recentActivityItem}
  <ActivityLogPreviewItem activity={recentActivityItem} />
{/if}
