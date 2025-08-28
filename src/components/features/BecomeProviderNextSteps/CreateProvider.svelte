<script lang="ts">
  import { dotApi } from '$lib/stores';
  import { getExtension, providerNameToHuman } from '$lib/utils';
  import { submitCreateProvider } from '$lib/connections';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import { TxnStatus, type Activity, type MsaInfo } from '$lib/storeTypes';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import { activityLog } from '$lib/stores/activityLogStore';
  import ActivityLogPreviewItem from '../ActivityLogItem/ActivityLogItem.svelte';
  import BackHomeButton from '$atoms/BackHomeButton.svelte';
  import { Button, Input } from '@frequency-chain/style-guide';
  import { goto } from '$app/navigation';
  // TODO: uncomment on transition to svelte 5
  // import { base } from '$app/paths';

  interface Props {
    isLoading: boolean;
  }

  let { isLoading = $bindable(false) }: Props = $props();

  let newProviderName = $state('');
  let recentActivityItem: Activity | undefined = $state();
  let recentTxnId: Activity['txnId'] | undefined = $state();
  let error: string | undefined = $state();

  // a callback for when a transaction hits a final state
  let createProviderTxnFinished = async (succeeded: boolean) => {
    if (succeeded) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const msaInfo: MsaInfo = await getMsaInfo($dotApi.api!, $user.address);
      $user.providerName = providerNameToHuman(msaInfo.providerName);
      $user.isProvider = msaInfo.isProvider;
      isLoading = false;
      // TODO: make nav reactive so we don't have to do this
      // TODO: uncomment on transition to svelte 5
      // goto(base + '/');
      goto('/');
    }
  };

  let handledTxnIds = new Set<string>();

  $effect(() => {
    const recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);

    if (
      recentActivityItem &&
      recentActivityItem.txnStatus !== TxnStatus.LOADING &&
      !handledTxnIds.has(recentActivityItem.txnId)
    ) {
      handledTxnIds.add(recentActivityItem.txnId);
      createProviderTxnFinished(recentActivityItem.txnStatus === TxnStatus.SUCCESS);
    }
  });

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
    isLoading = true;
    try {
      recentTxnId = await submitCreateProvider($dotApi.api, await getExtension($user), $user, newProviderName);
      recentActivityItem = $activityLog.find((value) => value.txnId === recentTxnId);
    } catch (err) {
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };
</script>

<form id="create-provider" class="column gap-f16">
  <Input
    label="Provider name"
    id="providerNameCB"
    type="text"
    required
    placeholder="Short name"
    maxlength={16}
    bind:value={newProviderName}
    oninput={() => (error = undefined)}
    {error}
    disabled={false}
  />
  <div class="flex items-end justify-between">
    <Button id="create-provider-btn" onclick={doCreateProvider} disabled={isLoading || newProviderName.length < 1}>
      {#if isLoading}
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
