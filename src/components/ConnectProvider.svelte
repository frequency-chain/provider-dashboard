<script lang="ts">
  import Modal from '../components/Modal.svelte';
  import LoginForm from './LoginForm.svelte';
  export let close = () => {};
  export let isOpen: boolean = false;
</script>

<Modal id="connect-provider" {close} {isOpen}>
  <span slot="title">Connect Provider</span>

  <LoginForm slot="body" onConnect={close} onCancel={close} />
</Modal>
