<script lang="ts">
  import Modal from '../components/Modal.svelte';
  import LoginForm from './LoginForm.svelte';

  interface Props {
    close: () => void;
    isOpen: boolean;
  }

  let { close, isOpen = false }: Props = $props();
</script>

<Modal id="connect-provider" {close} {isOpen} title="Connect Provider">
  <LoginForm onConnect={close} onCancel={close} />
</Modal>
