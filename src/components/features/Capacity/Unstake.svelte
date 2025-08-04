<script lang="ts">
  import Modal from '../../atoms/Modal.svelte';
  import UnstakeForm from './UnstakeForm.svelte';
  import { storeChainInfo } from '$lib/stores';

  interface Props {
    isOpen?: boolean;
    close?: () => void;
    unstakeAmount?: bigint;
  }

  let { isOpen = false, close = () => {}, unstakeAmount = 1n }: Props = $props();
</script>

<Modal id="unstake-from-provider" {isOpen} {close}>
  {#snippet title()}
    <span>Unstake from Provider</span>
  {/snippet}

  {#snippet body()}
    <div class="column gap-f16">
      <UnstakeForm {close} {unstakeAmount} />

      <span class="border-b-divider min-w-full border-b"></span>

      <div>
        <div class="lgText mb-2 font-bold">Requirements</div>
        <ol class="ordered-list smText">
          <li>Ensure the Control Key has a <span class="units">{$storeChainInfo.token}</span> balance.</li>
          <li>Click 'Unstake'.</li>
          <li>This will require 1 signature to send the transaction.</li>
        </ol>
      </div>
    </div>
  {/snippet}
</Modal>
