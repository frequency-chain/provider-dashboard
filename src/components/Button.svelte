<script lang="ts">
  export let title: string = '';
  export let action = () => {};
</script>

<button on:click|preventDefault={action} class="btn-primary" {...$$restProps}>{title}</button>
