<script lang="ts">
  import { Modal } from '@frequency-chain/style-guide';
  import LoginForm from '../LoginForm/LoginForm.svelte';
  import { IconButton } from '@frequency-chain/style-guide';
  import Switch from '$lib/assets/Switch.svelte';
</script>

<Modal id="connect-provider" title="Connect Provider">
  {#snippet trigger()}
    <IconButton label="switch button" ><Switch /></IconButton>
  {/snippet}
  {#snippet body()}
    <LoginForm onConnect={close} onCancel={close} />
  {/snippet}
  </Modal>
