<script lang="ts">
  import { logout } from '$lib/stores';
  import ButtonNoFill from './ButtonNoFill.svelte';
  let { cancelText = 'Cancel' } = $props();
</script>

<ButtonNoFill href="/" data-testid="back-home" onclick={logout}>{cancelText}</ButtonNoFill>
