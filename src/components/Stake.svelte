<script lang="ts">
  import Modal from './Modal.svelte';
  import StakeForm from './StakeForm.svelte';
  import { storeChainInfo } from '$lib/stores';

  interface Props {
    isOpen: boolean;
    close: () => void;
    stakeAmount?: bigint;
  }

  let { isOpen, close, stakeAmount = 1n }: Props = $props();
</script>

<Modal id="stake-to-provider" {isOpen} {close} title="Stake to Provider">
  <div>
    <StakeForm {close} {stakeAmount} />

    <span class="min-w-full border-b border-b-divider"></span>

    <div>
      <div class="label mb-2">Requirements</div>
      <ol class="ordered-list text-sm">
        <li>Ensure the Account Id has a <span class="units">{$storeChainInfo.token}</span> balance.</li>
        <li>Click 'Stake'.</li>
        <li>This will require 1 signature to send the transaction.</li>
      </ol>
    </div>
  </div>
</Modal>
