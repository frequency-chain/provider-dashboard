<script lang="ts">
  import { dotApi, storeConnected, storeCurrentAction, transactionSigningAddress } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { submitAddControlKey } from '$lib/connections';
  import { ActionForms, defaultDotApi } from '$lib/storeTypes';
  import KeySelection from './KeySelection.svelte';
  import { onMount } from 'svelte';
  import { isFunction } from '@polkadot/util';
  import { isLocalhost } from '$lib/utils';
  import TransactionStatus from './TransactionStatus.svelte';

  let connected = false;
  let thisDotApi = defaultDotApi;
  let signingAddress: string = '';
  let showSelf: boolean = false;
  let selectedKeyToAdd: string = '';
  let web3FromSource;
  let web3Enable;
  let showTransactionStatus = false;
  export let txnStatuses: Array<string> = [];

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    web3FromSource = extension.web3FromSource;
    web3Enable = extension.web3Enable;
  });

  export let providerId = 0;
  export let validAccounts = {};

  storeConnected.subscribe((val) => (connected = val));
  dotApi.subscribe((api) => {
    thisDotApi = api;
    selectedKeyToAdd = '';
  });
  transactionSigningAddress.subscribe((val) => (signingAddress = val));
  storeCurrentAction.subscribe((val) => (showSelf = val == ActionForms.AddControlKey));

  const hideSelf = () => {
    storeCurrentAction.update((val) => (val = ActionForms.NoForm));
    clearTxnStatuses();
  };

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());

  const addControlKey = async (evt: Event) => {
    clearTxnStatuses();
    let endpointURI: string = thisDotApi.selectedEndpoint || '';
    evt.preventDefault();
    if (selectedKeyToAdd === '') {
      alert('Please choose a key to add.');
    } else if (isFunction(web3FromSource) && isFunction(web3Enable)) {
      let newKeys = validAccounts[selectedKeyToAdd];
      let signingKeys = validAccounts[signingAddress];
      showTransactionStatus = true;
      if (isLocalhost(endpointURI)) {
        await submitAddControlKey(
          thisDotApi.api as ApiPromise,
          undefined,
          newKeys,
          signingKeys,
          providerId,
          endpointURI as string,
          addNewTxnStatus
        );
      } else {
        const extensions = web3Enable('Frequency parachain provider dashboard: Adding Keys');
        if (extensions.length !== 0) {
          const injectedExtension = await web3FromSource(signingKeys.meta.source);
          await submitAddControlKey(
            thisDotApi.api as ApiPromise,
            injectedExtension,
            newKeys,
            signingKeys,
            providerId,
            endpointURI as string,
            addNewTxnStatus
          );
        }
      }
    }
  };
  // TODO: make this component show and hide like the other actions.
</script>

<div id='add-control-key' class:hidden={!(connected && showSelf)}>
  <h3>Add a Control Key to Provider Id {providerId}</h3>
  <div class="directions">
    <p><strong>Directions</strong></p>
    <ol>
      <li>
        Ensure the new control key has a FRQCY balance if you intend to use it for submitting FRQCY or Capacity
        transactions.
      </li>
      <li>If using a wallet, ensure the new control key is imported into your wallet.</li>
      <li>Select the new control key from the dropdown list below.</li>
      <li>Click 'Add It.'</li>
      <li>This will require 3 signatures: two for the authorization payload, and one to send the transaction.</li>
      <ul>
        <li>Sign with the new control key</li>
        <li>Sign with the current control key</li>
        <li>Sign the transaction with the current control key</li>
      </ul>
    </ol>
  </div>
  <form>
    <KeySelection
      component="AddControlKey"
      selectLabel="Key to Add"
      bind:selectedOption={selectedKeyToAdd}
      {validAccounts}
    />
    <button on:click={addControlKey}>Add It</button>
    <button on:click={hideSelf}>Cancel Add</button>
    <TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
  </form>
</div>

<style>
  .directions {
    font-size: small;
  }
  .directions li {
    line-height: 1.1em;
  }
</style>
