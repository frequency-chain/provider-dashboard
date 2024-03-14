<script lang="ts">
  import { dotApi } from '$lib/stores';
  import { getExtension, providerNameToHuman } from '$lib/utils';
  import { submitCreateProvider } from '$lib/connections';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import type { MsaInfo } from '$lib/storeTypes';
  import { pageContent } from '$lib/stores/pageContentStore';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';

  export let updateUser: () => void;
  // a callback for when the user cancels this action
  export let cancelAction = () => {
    pageContent.login();
  };
  // a callback for when a transaction hits a final state
  //TODO
  let createProviderTxnFinished = async (succeeded: boolean, txnId: string) => {
    if (succeeded) {
      const msaInfo: MsaInfo = await getMsaInfo($dotApi.api!, $user.address);
      $user.providerName = providerNameToHuman(msaInfo.providerName);
      $user.isProvider = msaInfo.isProvider;
      updateUser();
      pageContent.dashboard();
    }
    isInProgress = false;
  };

  let newProviderName = '';
  let isInProgress = false;

  const doCreateProvider = async (_evt: Event) => {
    updateUser();

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
    showTransactionStatus = true;
    isInProgress = true;
    await submitCreateProvider($dotApi.api, await getExtension($user), $user, newProviderName);
    // createProviderTxnFinished
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
    <button on:click|preventDefault={cancelAction} class="btn-no-fill">Cancel</button>
  </div>
</form>
