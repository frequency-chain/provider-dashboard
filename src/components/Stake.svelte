<script lang="ts">
  import Modal from './Modal.svelte';
  import StakeForm from './StakeForm.svelte';
  import { storeChainInfo } from '$lib/stores';

  export let isOpen = false;
  export let close = () => {};
  export let stakeAmount: bigint = 1n;
</script>

<Modal id="stake-to-provider" {isOpen} {close}>
  <span slot="title">Stake to Provider</span>
  <svelte:fragment slot="body">
    <StakeForm {close} {stakeAmount} />

    <span class="min-w-full border-b border-b-divider" />

    <div>
      <div class="label mb-2">Requirements</div>
      <ol class="ordered-list text-xs">
        <li>Ensure the control key has a <span class="units">{$storeChainInfo.token}</span> balance.</li>
        <li>Click 'Stake'.</li>
        <li>This will require 1 signature to send the transaction.</li>
      </ol>
    </div>
  </svelte:fragment>
</Modal>
