<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { type Account } from '$lib/stores/accountsStore';
  import AddControlKeyForm from './AddControlKeyForm.svelte';
  import AddControlKeyRequirements from './AddControlKeyRequirements.svelte';
  import { Button, Modal } from '@frequency-chain/style-guide';

  let selectedAccount: Account | null = $state(null);

  function onCancel() {
    selectedAccount = null;
    close();
  }
</script>

<Modal id="add-account-id" close={onCancel} title={`Add Control Key to MSA (${$user.msaId}`}>
  {#snippet trigger()}
    <Button size="sm">Add Control Key</Button>
  {/snippet}
  {#snippet body()}
  <div class="column gap-f16">
    <AddControlKeyForm {onCancel} {selectedAccount} />

    <span class="border-b-divider min-w-full border-b"></span>

    <AddControlKeyRequirements />
  </div>
  {/snippet}
</Modal>
