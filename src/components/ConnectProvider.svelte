<script lang="ts">
  import Modal from '../components/Modal.svelte';
  import LoginForm from './LoginForm.svelte';
  interface Props {
    close?: () => void;
    isOpen?: boolean;
  }

  let { close = () => {}, isOpen = false }: Props = $props();
</script>

<Modal id="connect-provider" {close} {isOpen}>
  {#snippet title()}
    <span>Connect Provider</span>
  {/snippet}
  {#snippet body()}
    <LoginForm onConnect={close} onCancel={close} />
  {/snippet}
</Modal>
