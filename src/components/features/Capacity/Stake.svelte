<script lang="ts">
  import Modal from '../../atoms/Modal.svelte';
  import StakeForm from './StakeForm.svelte';
  import { storeChainInfo } from '$lib/stores';

  interface Props {
    isOpen?: boolean;
    close?: () => void;
    stakeAmount?: bigint;
  }

  let { isOpen = false, close = () => {}, stakeAmount = 1n }: Props = $props();
</script>

<Modal id="stake-to-provider" {isOpen} {close}>
  {#snippet title()}
    <span>Stake to Provider</span>
  {/snippet}

  {#snippet body()}
    <div class="column gap-f16">
      <StakeForm {close} {stakeAmount} />

      <span class="border-b-divider min-w-full border-b"></span>

      <div>
        <div class="lgText mb-2 font-bold">Requirements</div>
        <ol class="ordered-list smText">
          <li>Ensure the Control Key has a <span class="units">{$storeChainInfo.token}</span> balance.</li>
          <li>Click 'Stake'.</li>
          <li>This will require 1 signature to send the transaction.</li>
        </ol>
      </div>
    </div>
  {/snippet}
</Modal>
