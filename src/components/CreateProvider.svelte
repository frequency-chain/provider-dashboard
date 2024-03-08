<script lang="ts">
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { isLocalhost, providerNameToHuman } from '$lib/utils';
  import { submitCreateProvider } from '$lib/connections';
  import TransactionStatus from '$components/TransactionStatus.svelte';
  import { isFunction } from '@polkadot/util';
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import type { MsaInfo } from '$lib/storeTypes';
  import { pageContent } from '$lib/stores/pageContentStore';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';

  export let updateUser: () => void;
  export let txnStatuses: Array<string> = [];
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
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;
  let showTransactionStatus = false;
  let isInProgress = false;

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

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
    clearTxnStatuses();
    showTransactionStatus = true;
    isInProgress = true;
    const apiPromise = $dotApi.api as ApiPromise;
    if (isLocalhost(endpointURI)) {
      await submitCreateProvider(
        apiPromise,
        undefined,
        endpointURI,
        $user.signingKey!,
        newProviderName,
      );
    } else {
      if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
        const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Creating provider');
        if (extensions.length !== 0) {
          const injectedExtension = await thisWeb3FromSource($user.signingKey!.meta.source!);
          await submitCreateProvider(
            apiPromise,
            injectedExtension,
            endpointURI,
            $user.signingKey!,
            newProviderName,
          );
        }
      }
    }
  };

  const createProviderAddNewTxnStatus = (txnStatus: string, txnId: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
    return;
  };

  const clearTxnStatuses = () => (txnStatuses = new Array<string>());
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
<TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
