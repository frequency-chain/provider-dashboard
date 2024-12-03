<script lang="ts">
  let { cancelText = 'Cancel', classes = '' } = $props();
</script>

<a href="/" class={classes} data-testid="back-home">{cancelText}</a>
