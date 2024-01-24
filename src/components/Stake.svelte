<script lang="ts">
  import { dotApi, storeCurrentAction, storeMsaInfo, storeToken, transactionSigningAddress } from '$lib/stores';
  import { storeValidAccounts } from '$lib/stores/accountsStore';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake } from '$lib/connections';
  import { ActionForms, defaultDotApi } from '$lib/storeTypes';
  import type { MsaInfo } from '$lib/storeTypes';
  import KeySelection from './KeySelection.svelte';
  import { onMount } from 'svelte';
  import { isFunction } from '@polkadot/util';
  import { isLocalhost } from '$lib/utils';
  import TransactionStatus from './TransactionStatus.svelte';
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import type { AccountMap } from '$lib/polkadotApi';

  let thisDotApi = defaultDotApi;
  let signingAddress: string = ''; // eslint-disable-line no-unused-vars
  let showSelf: boolean = false; // eslint-disable-line no-unused-vars
  let selectedKey: string = '';
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;
  let showTransactionStatus = false;
  export let stakeAmount: bigint = 1n;
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
  export let cancelAction = () => {};
  export let txnFinished = () => {};

  dotApi.subscribe((api) => (thisDotApi = api));
  transactionSigningAddress.subscribe((val) => (signingAddress = val));
  storeCurrentAction.subscribe((val) => (showSelf = val == ActionForms.Stake));
  storeMsaInfo.subscribe((info: MsaInfo) => (providerId = info.isProvider ? info.msaId : 0));
  storeValidAccounts.subscribe((val) => (validAccounts = val));
  storeToken.subscribe((val) => (token = val));

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());

  const stake = async (evt: Event) => {
    clearTxnStatuses();
    let endpointURI: string = thisDotApi.selectedEndpoint || '';
    if (selectedKey === '') {
      alert('Please choose a key to stake from.');
    } else {
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
          addNewTxnStatus,
          txnFinished
        );
      } else {
        if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
          const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Adding Keys');
          if (extensions.length !== 0) {
            const injectedExtension = await thisWeb3FromSource(signingKeys.meta.source.toString());
            await submitStake(
              thisDotApi.api as ApiPromise,
              injectedExtension,
              signingKeys,
              providerId,
              stakeAmountInDollars,
              endpointURI as string,
              addNewTxnStatus,
              txnFinished
            );
          }
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

<div class:hidden={false} class="action-card basis-1/2">
  <p class="action-card-title">
    Stake to Provider Id {providerId}
  </p>
  <div>
    <ol class="ml-4 mt-4 list-decimal font-light">
      <li>Ensure the control key has a FRQCY balance.</li>
      <li>Click 'Stake'</li>
      <li>This will require 1 signature to send the transaction.</li>
    </ol>
  </div>
  <form class="mt-8">
    <KeySelection
      component="SelectControlKey"
      selectLabel="Key to Stake From"
      bind:selectedOption={selectedKey}
      {validAccounts}
      classOverrides="border-2 rounded-lg"
    />
    <div class="mt-6">
      <label for="stakingInput">Amount to Stake in <span class="units">{token}</span></label>
      <div class="input-container mt-2">
        <input type="number" id="stakingInput" value="1" on:input={handleInput} />
      </div>
    </div>
    <div class="w-350 flex justify-between">
      <button on:click|preventDefault={stake} class="btn-primary">Stake</button>
      <button on:click|preventDefault={cancelAction} class="btn-no-fill">Cancel</button>
    </div>
  </form>
</div>
<TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />

<style>
  #stakingInput::-webkit-inner-spin-button,
  #stakingInput::-webkit-outer-spin-button {
    margin-left: 10px;
  }
</style>
