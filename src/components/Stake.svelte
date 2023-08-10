<script lang="ts">
  import {
    dotApi,
    storeConnected,
    storeCurrentAction,
    storeProviderId,
    storeToken,
    storeValidAccounts,
    transactionSigningAddress,
  } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake } from '$lib/connections';
  import { ActionForms, defaultDotApi } from '$lib/storeTypes';
  import KeySelection from './KeySelection.svelte';
  import { onMount } from 'svelte';
  import { isFunction } from '@polkadot/util';
  import { isLocalhost } from '$lib/utils';
  import TransactionStatus from './TransactionStatus.svelte';
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import type { AccountMap } from '$lib/polkadotApi';

  let connected = false;
  let thisDotApi = defaultDotApi;
  let signingAddress: string = ''; // eslint-disable-line no-unused-vars
  let showSelf: boolean = false; // eslint-disable-line no-unused-vars
  let selectedKey: string = '';
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;
  let showTransactionStatus = false;
  let stakeAmount: bigint = 1n;
  let token = '';
  export let txnStatuses: Array<string> = [];

  $: stakeAmountInDollars = BigInt.asUintN(64, stakeAmount) * BigInt.asUintN(64, DOLLARS);

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

  export let providerId = 0;
  export let validAccounts: AccountMap = {};

  storeConnected.subscribe((val) => (connected = val));
  dotApi.subscribe((api) => (thisDotApi = api));
  transactionSigningAddress.subscribe((val) => (signingAddress = val));
  storeCurrentAction.subscribe((val) => (showSelf = val == ActionForms.Stake));
  storeProviderId.subscribe((val) => (providerId = val));
  storeValidAccounts.subscribe((val) => (validAccounts = val));
  storeToken.subscribe((val) => (token = val));

  const hideSelf = () => {
    storeCurrentAction.update((val) => (val = ActionForms.NoForm));
    clearTxnStatuses();
  };

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());

  const stake = async (evt: Event) => {
    evt.preventDefault();
    clearTxnStatuses();
    let endpointURI: string = thisDotApi.selectedEndpoint || '';
    evt.preventDefault();
    if (selectedKey === '') {
      alert('Please choose a key to stake from.');
    } else if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
      let signingKeys = validAccounts[selectedKey];
      showTransactionStatus = true;
      if (isLocalhost(endpointURI)) {
        await submitStake(
          thisDotApi.api as ApiPromise,
          undefined,
          signingKeys,
          providerId,
          stakeAmountInDollars,
          endpointURI as string,
          addNewTxnStatus
        );
      } else {
        const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Adding Keys');
        if (extensions.length !== 0) {
          const injectedExtension = await thisWeb3FromSource(signingKeys.meta.source);
          await submitStake(
            thisDotApi.api as ApiPromise,
            injectedExtension,
            signingKeys,
            providerId,
            stakeAmountInDollars,
            endpointURI as string,
            addNewTxnStatus
          );
        }
      }
    }
  };

  function handleInput(evt: Event) {
    const target = evt.target as HTMLInputElement;
    if (target !== null && target.value === '') {
      stakeAmount = 0n;
    } else if (target !== null && target.value !== null) {
      stakeAmount = BigInt(target.value);
      return;
    }
  }
</script>

<div class:hidden={!(connected && showSelf)}>
  <h3>Stake to Provider Id {providerId}</h3>
  <div class="directions">
    <p><strong>Directions</strong></p>
    <ol>
      <li>Ensure the control key has a FRQCY balance.</li>
      <li>Click 'Stake'</li>
      <li>This will require 1 signature to send the transaction.</li>
    </ol>
  </div>
  <form>
    <KeySelection
      component="SelectControlKey"
      selectLabel="Key to Stake From"
      bind:selectedOption={selectedKey}
      {validAccounts}
    />
    <label for="stakingInput">Amount to Stake in Tokens</label>
    <div class="input-container">
      <input type="number" id="stakingInput" value="1" style="text-align: right;" on:input={handleInput} />
      <span class="units">{token}</span>
    </div>
    <button on:click={stake}>Stake</button>
    <button on:click={hideSelf}>Cancel Stake</button>
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
  .input-container {
    display: flex;
    align-items: center;
  }
  .input-container input {
    flex: 1;
  }
  .input-container .units {
    flex: 1;
    margin-left: 0.5em;
    align-content: center;
  }

  #stakingInput::-webkit-inner-spin-button,
  #stakingInput::-webkit-outer-spin-button {
    margin-left: 10px;
  }
</style>
