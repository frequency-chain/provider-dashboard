<script lang="ts">
  import { logout } from '$lib/stores';
  let { cancelText = 'Cancel', classes = '' } = $props();
</script>

<a href="/" class={`btn-no-fill ${classes}`} data-testid="back-home" on:click={logout}>{cancelText}</a>
