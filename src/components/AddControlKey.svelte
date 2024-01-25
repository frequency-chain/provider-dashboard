<script lang="ts">
  import { dotApi, storeConnected, storeCurrentAction, transactionSigningAddress } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { submitAddControlKey } from '$lib/connections';
  import { ActionForms, defaultDotApi } from '$lib/storeTypes';
  import { onMount } from 'svelte';
  import { isFunction } from '@polkadot/util';
  import { isLocalhost } from '$lib/utils';
  import TransactionStatus from './TransactionStatus.svelte';
  import DropDownMenu from './DropDownMenu.svelte';

  let connected = false;
  let thisDotApi = defaultDotApi;
  let signingAddress: string = '';
  let showSelf: boolean = false;
  let selectedKeyToAdd: string = '';
  let web3FromSource;
  let web3Enable;
  let showTransactionStatus = false;
  let txnFinished = () => {};
  export let txnStatuses: Array<string> = [];
  export let cancelAction;

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

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());

  const addControlKey = async (evt: Event) => {
    clearTxnStatuses();
    let endpointURI: string = thisDotApi.selectedEndpoint || '';
    if (selectedKeyToAdd === '') {
      alert('Please choose a key to add.');
    } else {
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
          addNewTxnStatus,
          txnFinished
        );
      } else {
        if (isFunction(web3FromSource) && isFunction(web3Enable)) {
          const extensions = await web3Enable('Frequency parachain provider dashboard: Adding Keys');
          if (extensions.length !== 0) {
            const injectedExtension = await web3FromSource(signingKeys.meta.source);
            await submitAddControlKey(
              thisDotApi.api as ApiPromise,
              injectedExtension,
              newKeys,
              signingKeys,
              providerId,
              endpointURI as string,
              addNewTxnStatus,
              txnFinished
            );
          } else {
            console.error('found no extensions');
            return;
          }
        } else {
          console.error('web3FromSource is function? ', isFunction(web3FromSource));
          console.error('web3Enable is function? ', isFunction(web3Enable));
        }
      }
    }
  };
</script>

<div id="add-control-key" class:hidden={!(connected && showSelf)} class="action-card basis-1/2">
  <p class="action-card-title">
    Add a Control Key to Provider Id {providerId}
  </p>
  <ol class="ml-4 mt-4 list-decimal font-light">
    <li>
      Ensure the new control key has a FRQCY balance if you intend to use it for submitting FRQCY or Capacity
      transactions.
    </li>
    <li>If using a wallet, ensure the new control key is imported into your wallet.</li>
    <li>Select the new control key from the dropdown list below.</li>
    <li>Click 'Add It.'</li>
    <li>This requires 3 signatures: two for the authorization payload, and one to send the transaction.</li>
    <ul class="ml-6 list-disc">
      <li>Sign with the new control key,</li>
      <li>Sign with the current control key,</li>
      <li>Sign the transaction with the current control key.</li>
    </ul>
  </ol>
  <form class="mt-8">
    <DropDownMenu id="AddControlKey" label="Key to Add" selected={selectedKeyToAdd} options={validAccounts} />
    <div class="w-350 flex justify-between">
      <button on:click|preventDefault={addControlKey} class="btn-primary">Add It</button>
      <button on:click|preventDefault={cancelAction} class="btn-no-fill">Cancel Add </button>
    </div>
  </form>
</div>
<TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
