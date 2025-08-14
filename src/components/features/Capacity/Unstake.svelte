<script lang="ts">
  import UnstakeForm from './UnstakeForm.svelte';
  import { storeChainInfo } from '$lib/stores';
  import { Button, Modal } from '@frequency-chain/style-guide';
</script>

<Modal id="unstake-from-provider" title="Unstake from Provider">
  {#snippet trigger()}
    <Button size="sm">Unstake from Provider</Button>
  {/snippet}
  {#snippet body()}
    <div class="column gap-f16">
      <UnstakeForm />

      <span class="border-b-divider min-w-full border-b"></span>

      <div>
        <div class="lgText mb-2 font-bold">Requirements</div>
        <ol class="ordered-list smText">
          <li>Ensure the Control Key has a <span class="units">{$storeChainInfo.token}</span> balance staked.</li>
          <li>Click 'Unstake'.</li>
          <li>This will require 1 signature to send the transaction.</li>
        </ol>
      </div>
    </div>
  {/snippet}
</Modal>
