<script lang="ts">
  import { dotApi } from '$lib/stores';
  import { getExtension, providerNameToHuman } from '$lib/utils';
  import { submitCreateProvider } from '$lib/connections';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import { TxnStatus, type Activity, type MsaInfo } from '$lib/storeTypes';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import ActivityLogPreviewItem from './ActivityLogPreviewItem.svelte';
  import BackHomeButton from '$components/BackHomeButton.svelte';
  import { Button } from '@frequency-chain/style-guide';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  let newProviderName = '';
  let isInProgress = false;
  let recentActivityItem: Activity | undefined;
  let recentTxnId: Activity['txnId'] | undefined;

  // a callback for when a transaction hits a final state
  let createProviderTxnFinished = async (succeeded: boolean) => {
    if (succeeded) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const msaInfo: MsaInfo = await getMsaInfo($dotApi.api!, $user.address);
      $user.providerName = providerNameToHuman(msaInfo.providerName);
      $user.isProvider = msaInfo.isProvider;
      isInProgress = false;
      // TODO: make nav reactive so we don't have to do this
      goto(base + '/');
    }
  };

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

<form id="create-provider" class="column gap-f16">
  <div>
    <label for="providerNameCB" class="label block">Provider name</label>
    <input
      id="providerNameCB"
      class="mt-f8 h-f40 w-full max-w-[420px] p-2 text-normal"
      required
      placeholder="Short name"
      maxlength={16}
      bind:value={newProviderName}
    />
  </div>
  <div class="flex items-end justify-between">
    <Button
      type="primary"
      id="create-provider-btn"
      class="disabled:bg-gray3 disabled:text-white disabled:hover:shadow-none"
      onclick={doCreateProvider}
      disabled={isInProgress}
    >
      {#if isInProgress}
        <LoadingIcon />
      {:else}
        Create Provider
      {/if}
    </Button>
    <BackHomeButton />
  </div>
</form>

{#if recentActivityItem}
  <ActivityLogPreviewItem activity={recentActivityItem} />
{/if}
