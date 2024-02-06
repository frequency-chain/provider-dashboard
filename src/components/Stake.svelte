<script lang="ts">
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake, type TxnFinishedCallback } from '$lib/connections';
  import { onMount } from 'svelte';
  import { isFunction } from '@polkadot/util';
  import { formatAccount, isLocalhost } from '$lib/utils';
  import TransactionStatus from './TransactionStatus.svelte';
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import DropDownMenu from './DropDownMenu.svelte';
  import Modal from './Modal.svelte';
  import { user } from '$lib/stores/userStore';
  import { Account, providerAccountsStore } from '$lib/stores/accountsStore';
  import BlockSection from './BlockSection.svelte';
  import { storeChainInfo } from '$lib/stores';

  export let isOpen = false;
  export let close = () => {};

  let selectedAccount: Account;
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;
  let showTransactionStatus = false;

  export let stakeAmount: bigint = 1n;
  export let txnStatuses: Array<string> = [];

  $: stakeAmountInPlancks = BigInt.asUintN(64, stakeAmount) * BigInt.asUintN(64, DOLLARS);

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

  export let providerId = 0;
  export let txnFinished: TxnFinishedCallback = (succeeded: boolean) => {};

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());

  const stake = async (evt: Event) => {
    clearTxnStatuses();
    let endpointURI: string = $dotApi.selectedEndpoint || '';
    showTransactionStatus = true;
    if (isLocalhost(endpointURI)) {
      await submitStake(
        $dotApi.api as ApiPromise,
        undefined,
        $user.signingKey!,
        providerId,
        stakeAmountInPlancks,
        endpointURI,
        addNewTxnStatus,
        txnFinished
      );
    } else {
      if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
        const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Adding Keys');
        if (extensions.length !== 0) {
          const injectedExtension = await thisWeb3FromSource($user.signingKey!.meta.source!);
          await submitStake(
            $dotApi.api as ApiPromise,
            injectedExtension,
            $user.signingKey!,
            providerId,
            stakeAmountInPlancks,
            endpointURI,
            addNewTxnStatus,
            txnFinished
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

<Modal id="stake-to-provider" {isOpen} {close}>
  <BlockSection title="Stake to Provider">
    <form class="column">
      <DropDownMenu
        id="stake-using-key"
        label="Wallet Address"
        bind:value={selectedAccount}
        options={Array.from($allAccountsStore.values())}
        formatter={formatAccount}
        onChange={() => {}}
      />
      <div>
        <label for="stakingInput" class="label mb-3.5 block"
          >Amount in <span class="units">{$storeChainInfo.token}</span></label
        >
        <div class="input-container mt-2">
          <input type="number" id="stakingInput" min="0" value="1" on:input={handleInput} />
        </div>
      </div>
      <div class="flex w-[320px] items-end justify-between">
        <button on:click|preventDefault={stake} class="btn-primary" aria-label="Stake">Stake</button>
        <button class="btn-no-fill" on:click|preventDefault={close}>Cancel</button>
      </div>
    </form>

    <span class="min-w-full border-b border-b-divider" />

    <div>
      <div class="label mb-2">Requirements</div>
      <ol class="ordered-list text-xs">
        1. Ensure the control key has a <span class="units">{$storeChainInfo.token}</span> balance.
      </ol>
      <ol class="ordered-list text-xs">2. Click 'Stake'</ol>
      <ol class="ordered-list text-xs">3. This will require 1 signature to send the transaction.</ol>
    </div>
  </BlockSection>

  {#if showTransactionStatus}
    <span class="min-w-full border-b border-b-divider" />
  {/if}

  <TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
</Modal>

<style>
  #stakingInput::-webkit-inner-spin-button,
  #stakingInput::-webkit-outer-spin-button {
    margin-left: 10px;
  }
</style>
