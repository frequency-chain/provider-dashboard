<script lang="ts">
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import { dotApi } from '$lib/stores';
  import type { DotApi } from '$lib/storeTypes';
  import { defaultDotApi } from '$lib/storeTypes';
  import type { ApiPromise } from '@polkadot/api';
  import { isLocalhost } from '$lib/utils';
  import { submitCreateProvider } from '$lib/connections';
  import TransactionStatus from '$components/TransactionStatus.svelte';
  import { isFunction } from '@polkadot/util';
  import { onMount } from 'svelte';

  let newProviderName = '';
  let localDotApi: DotApi = defaultDotApi;
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;
  let showTransactionStatus = false;
  export let txnStatuses: Array<string> = [];
  export let validAccounts = {};
  export let signingAddress = '';
  // a callback for when the user cancels this action
  export let cancelAction = () => {};
  // a callback for when a transaction hits a final state
  export let txnFinished = () => {
    console.log('default txnFinished callback');
  };

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

  dotApi.subscribe((api: DotApi) => (localDotApi = api));

  const doCreateProvider = async (_evt: Event) => {
    if (newProviderName === '') {
      alert('please enter a Provider Name');
      return;
    }
    if (!localDotApi) {
      alert('please reconnect to an endpoint');
      return;
    }
    clearTxnStatuses();
    let endpointURI: string = localDotApi.selectedEndpoint || '';
    let signingKeys = validAccounts[signingAddress];
    showTransactionStatus = true;
    const apiPromise = localDotApi.api as ApiPromise;
    if (isLocalhost(endpointURI)) {
      await submitCreateProvider(
        apiPromise,
        undefined,
        endpointURI,
        signingKeys,
        newProviderName,
        addNewTxnStatus,
        txnFinished
      );
    } else {
      if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
        const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Creating provider');
        if (extensions.length !== 0) {
          const injectedExtension = await thisWeb3FromSource(signingKeys.meta.source);
          await submitCreateProvider(
            apiPromise,
            injectedExtension,
            endpointURI,
            signingKeys,
            newProviderName,
            addNewTxnStatus,
            txnFinished
          );
        }
      }
    }
  };

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
    return;
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());
</script>

<div id="create-provider" class="action-card basis-1/2">
  <p>
    For developer and testing convenience, on Testnet, anyone with an MSA who wishes to become a Provider may simply
    submit a <code>createProvider</code> transaction.
  </p>
  <p>
    This action will register the MSA Id that is controlled by the selected Transaction Signing Address above. Any
    control key for the MSA Id can submit the transaction.
  </p>
  <form>
    <label for="providerNameCB">Provider name</label>
    <input id="providerNameCB" required placeholder="Short name" maxlength={100} bind:value={newProviderName} />
    <div class="flex w-350 justify-between">
      <button id="create-provider-btn" on:click|preventDefault={doCreateProvider} class="btn-primary">
        Create Provider
      </button>
      <button on:click|preventDefault={cancelAction} class="btn-no-fill">Cancel</button>
    </div>
  </form>
</div>
<TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
