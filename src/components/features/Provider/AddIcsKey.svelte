<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import AddIcsKeyForm from './AddIcsKeyForm.svelte';
  import AddIcsKeyRequirements from './AddIcsKeyRequirements.svelte';
  import { Button, Modal } from '@frequency-chain/style-guide';

  let modalOpen: boolean = $state(false);
</script>

<Modal
  id="add-ics-public-key-id"
  title={`Add ICS Public Key to MSA (${$user.msaId})`}
  open={modalOpen}
  onOpenChange={(val: boolean) => (modalOpen = val)}
>
  {#snippet trigger()}
    <Button size="sm">Add ICS Key</Button>
  {/snippet}
  {#snippet body()}
    <div class="column gap-f16">
      <AddIcsKeyForm bind:modalOpen />

      <span class="border-b-divider min-w-full border-b"></span>

      <AddIcsKeyRequirements />
    </div>
  {/snippet}
</Modal>
