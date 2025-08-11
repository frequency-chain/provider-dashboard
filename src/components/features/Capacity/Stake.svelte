<script lang="ts">
  import StakeForm from './StakeForm.svelte';
  import { storeChainInfo } from '$lib/stores';
  import { Button, Modal } from '@frequency-chain/style-guide';
</script>

<Modal id="stake-to-provider" title="Stake to Provider">
  {#snippet trigger()}
    <Button size="sm">Stake to Provider</Button>
  {/snippet}
  {#snippet body()}
    <div class="column gap-f16">
      <StakeForm />

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
