<script lang="ts">
  import { dotApi } from '$lib/stores';
  import { submitRequestToBeProvider } from '$lib/connections';
  import { defaultDotApi } from '$lib/storeTypes';
  import type { Activity, DotApi } from '$lib/storeTypes';
  import { getExtension, createMailto } from '$lib/utils';
  import type { ApiPromise } from '@polkadot/api';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import ActivityLogPreviewItem from './ActivityLogPreviewItem.svelte';

  let isInProgress = false;
  let recentActivityItem: Activity;
  let newProviderName = '';
  let localDotApi: DotApi = defaultDotApi;
  let mailTo = createMailto('hello@frequency.xyz', 'Request to be a Provider', '');
  // a callback for when the user cancels this action

  dotApi.subscribe((api) => (localDotApi = api));

  const doProposeToBeProvider = async (_evt: Event) => {
    isInProgress = true;
    if (newProviderName === '') {
      alert('please enter a Provider Name');
      return;
    }
    if (!localDotApi) {
      alert('please reconnect to an endpoint');
      return;
    }
    await submitRequestToBeProvider(localDotApi.api as ApiPromise, await getExtension($user), $user, newProviderName);
    isInProgress = false;
  };

  $: {
    if (isInProgress) {
      recentActivityItem = $activityLog[0];
    }
  }
</script>

<div id="request-to-be-provider" class="action-card basis-1/2">
  <h2>Request to Be a Provider</h2>
  <h3>What is a Provider?</h3>
  <p>A Provider is an MSA holder on Frequency with special permissions.</p>
  <ol>
    <li>They can pay for transactions with Capacity as well as Frequency token.</li>
    <li>They can be permitted to post certain transactions on another MSA's behalf, also known as delegation.</li>
    <li>An MSA can stake token to generate Capacity, and designate a Provider to receive that Capacity.</li>
  </ol>
  <p>Anyone with an MSA ID on Frequency's Mainnet who wants to become a Provider must follow this process:</p>
  <ol>
    <li>Submit an on-chain transaction to request be become a provider by filling in and submitting the form below.</li>
    <li>
      <a href={mailTo} class="underline"> Contact the Frequency Council </a>
      and inform them that you have requested to become a Provider, and provide them with your MSA Id.
    </li>
  </ol>
  <form>
    <label for="providerNameRtB">Provider name</label>
    <input id="providerNameRtB" placeholder="Short name" maxlength="16" bind:value={newProviderName} />
    <div class="flex w-[350px] justify-between">
      <button on:click|preventDefault={doProposeToBeProvider} id="request-2b-provider-btn" class="btn-primary">
        Submit Request To Be Provider</button
      >
      <a href="/" class="btn-cancel">Cancel</a>
    </div>
  </form>
</div>
{#if recentActivityItem}
  <ActivityLogPreviewItem activity={recentActivityItem} />
{/if}
