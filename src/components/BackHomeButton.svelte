<script lang="ts">
  let { cancelText = 'Cancel' } = $props();
</script>

<a href="/" class="btn-no-fill" data-testid="back-home">{cancelText}</a>
