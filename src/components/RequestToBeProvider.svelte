<script lang="ts">
  import { dotApi } from '$lib/stores';
  import { submitRequestToBeProvider, type TxnFinishedCallback } from '$lib/connections';
  import { onMount } from 'svelte';
  import { defaultDotApi } from '$lib/storeTypes';
  import type { DotApi } from '$lib/storeTypes';
  import { isFunction } from '@polkadot/util';
  import { isLocalhost, createMailto } from '$lib/utils';
  import type { ApiPromise } from '@polkadot/api';
  import TransactionStatus from '$components/TransactionStatus.svelte';
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import { user } from '$lib/stores/userStore';

  let newProviderName = '';
  let localDotApi: DotApi = defaultDotApi;
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;
  let showTransactionStatus = false;
  let mailTo = createMailto('hello@frequency.xyz', 'Request to be a Provider', '');
  export let txnStatuses: Array<string> = [];
  // a callback for when the user cancels this action
  export let cancelAction = () => {};
  // a callback for when a transaction hits a final state
  export let txnFinished: TxnFinishedCallback = (succeeded: boolean) => {
    console.log('default txnFinished callback');
  };

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

  dotApi.subscribe((api) => (localDotApi = api));

  const doProposeToBeProvider = async (_evt: Event) => {
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
    let signingKeys = $user.signingKey!;
    showTransactionStatus = true;
    if (isLocalhost(endpointURI)) {
      await submitRequestToBeProvider(
        localDotApi.api as ApiPromise,
        undefined,
        endpointURI,
        signingKeys,
        newProviderName,
        addNewTxnStatus,
        txnFinished
      );
    } else {
      if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
        const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Proposing to be provider');
        if (extensions.length !== 0) {
          const injectedExtension = await thisWeb3FromSource(signingKeys.meta.source!);
          await submitRequestToBeProvider(
            localDotApi.api as ApiPromise,
            injectedExtension,
            endpointURI,
            signingKeys,
            newProviderName,
            addNewTxnStatus,
            txnFinished
          );
        } else {
          console.error('found no extensions');
          return;
        }
      } else {
        console.error('web3FromSource is function? ', isFunction(thisWeb3FromSource));
        console.error('web3Enable is function? ', isFunction(thisWeb3Enable));
      }
    }
  };

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
    return;
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());
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
      <button on:click|preventDefault={cancelAction} class="btn-cancel">Cancel</button>
    </div>
  </form>
</div>
<TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
