<script lang="ts">
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import { dotApi } from '$lib/stores';
  import type { DotApi } from '$lib/storeTypes';
  import { defaultDotApi } from '$lib/storeTypes';
  import type { ApiPromise } from '@polkadot/api';
  import { isLocalhost, providerNameToHuman } from '$lib/utils';
  import { submitCreateProvider, type TxnFinishedCallback } from '$lib/connections';
  import TransactionStatus from '$components/TransactionStatus.svelte';
  import { isFunction } from '@polkadot/util';
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import type { MsaInfo } from '$lib/storeTypes';
  import { nonProviderAccountsStore, providerAccountsStore } from '$lib/stores/accountsStore';
  import { pageContent } from '$lib/stores/pageContentStore';

  let newProviderName = '';
  let localDotApi: DotApi = defaultDotApi;
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;
  let showTransactionStatus = false;
  export let txnStatuses: Array<string> = [];

  // a callback for when the user cancels this action
  export let cancelAction = () => {
    pageContent.login();
  };

  // a callback for when a transaction hits a final state
  export let txnFinished: TxnFinishedCallback = async (succeeded: boolean) => {
    if (succeeded) {
      const apiPromise = localDotApi.api as ApiPromise;
      const msaInfo: MsaInfo = await getMsaInfo(apiPromise, $user.address);
      $user.providerName = providerNameToHuman(msaInfo.providerName);
      $user.isProvider = msaInfo.isProvider;
      pageContent.dashboard();
    }
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
    showTransactionStatus = true;
    const apiPromise = localDotApi.api as ApiPromise;
    if (isLocalhost(endpointURI)) {
      await submitCreateProvider(
        apiPromise,
        undefined,
        endpointURI,
        $user.signingKey!,
        newProviderName,
        addNewTxnStatus,
        txnFinished
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

<form id="create-provider" class="column text-sm">
  <div>
    <label for="providerNameCB" class="label mb-3.5 block">Provider name</label>
    <input id="providerNameCB" required placeholder="Short name" maxlength={16} bind:value={newProviderName} />
  </div>
  <div class="w-[350px]flex items-end justify-between">
    <button id="create-provider-btn" on:click|preventDefault={doCreateProvider} class="btn-primary">
      Create Provider
    </button>
    <button on:click|preventDefault={cancelAction} class="btn-no-fill">Cancel</button>
  </div>
</form>
<TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
