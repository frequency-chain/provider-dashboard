<script lang="ts">
  import { logout } from '$lib/stores';
  let { cancelText = 'Cancel' } = $props();
</script>

<a href="/" class="btn-no-fill text-sm" data-testid="back-home" onclick={logout}>{cancelText}</a>
