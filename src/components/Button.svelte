<script lang="ts">
  let title: string = '';
  let action = () => {};
</script>

<div class="flex w-350 justify-between">
  <button on:click|preventDefault={action} class="btn-primary">{title}</button>
</div>
