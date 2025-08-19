<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { type Account } from '$lib/stores/accountsStore';
  import AddControlKeyForm from './AddControlKeyForm.svelte';
  import AddControlKeyRequirements from './AddControlKeyRequirements.svelte';
  import { Button, Modal } from '@frequency-chain/style-guide';

  let selectedAccount: Account | null = $state(null);
  let modalOpen: boolean = $state(false);
</script>

<Modal
  id="add-account-id"
  title={`Add Control Key to MSA (${$user.msaId})`}
  open={modalOpen}
  onOpenChange={(val: boolean) => (modalOpen = val)}
>
  {#snippet trigger()}
    <Button size="sm">Add Control Key</Button>
  {/snippet}
  {#snippet body()}
    <div class="column gap-f16">
      <AddControlKeyForm bind:selectedAccount bind:modalOpen />

      <span class="border-b-divider min-w-full border-b"></span>

      <AddControlKeyRequirements />
    </div>
  {/snippet}
</Modal>
