<script lang="ts">
  import TransactionStatus from './TransactionStatus.svelte';
  import Modal from './Modal.svelte';
  import StakeForm from './StakeForm.svelte';
  import { storeChainInfo } from '$lib/stores';
  import type { TxnFinishedCallback } from '$lib/connections';

  export let isOpen = false;
  export let close = () => {};
  export let stakeAmount: bigint = 1n;
  export let txnStatuses: Array<string> = [];
  export let providerId = 0;
  export let txnFinished: TxnFinishedCallback = (succeeded: boolean) => {};

  let showTransactionStatus = false;
</script>

<Modal id="stake-to-provider" {isOpen} {close}>
  <span slot="title">Stake to Provider</span>
  <svelte:fragment slot="body">
    <StakeForm {close} {stakeAmount} {txnFinished} bind:txnStatuses {providerId} bind:showTransactionStatus />

    <span class="min-w-full border-b border-b-divider" />

    <div>
      <div class="label mb-2">Requirements</div>
      <ol class="ordered-list text-xs">
        <li>Ensure the control key has a <span class="units">{$storeChainInfo.token}</span> balance.</li>
        <li>Click 'Stake'.</li>
        <li>This will require 1 signature to send the transaction.</li>
      </ol>
    </div>

    <TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
  </svelte:fragment>
</Modal>
