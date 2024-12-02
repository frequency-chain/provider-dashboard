<script lang="ts">
  import Modal from '../components/Modal.svelte';
  import LoginForm from './LoginForm.svelte';

  interface Props {
    close: () => void;
    isOpen: boolean;
  }

  let { close, isOpen = false }: Props = $props();
</script>

<Modal id="connect-provider" {close} {isOpen}>
  <span slot="title">Connect Provider</span>
  <LoginForm slot="body" onConnect={close} onCancel={close} />
</Modal>
