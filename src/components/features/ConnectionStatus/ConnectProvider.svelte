<script lang="ts">
  import { Modal } from '@frequency-chain/style-guide';
  import LoginForm from '../LoginForm/LoginForm.svelte';
  import { IconButton } from '@frequency-chain/style-guide';
  import Switch from '$lib/assets/Switch.svelte';

  let modalOpen: boolean = $state(false);
</script>

<Modal
  id="connect-provider"
  title="Connect Provider"
  open={modalOpen}
  onOpenChange={(val: boolean) => (modalOpen = val)}
>
  {#snippet trigger()}
    <IconButton label="switch button"><Switch /></IconButton>
  {/snippet}
  {#snippet body()}
    <LoginForm bind:modalOpen />
  {/snippet}
</Modal>
