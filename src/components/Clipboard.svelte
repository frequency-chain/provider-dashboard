<script lang="ts">
  import { onMount } from 'svelte';

  export let copyValue: string;

  let textarea: HTMLTextAreaElement;

  onMount(() => {
    textarea.select();
    document.execCommand('copy');
  });
</script>

<textarea bind:value={copyValue} bind:this={textarea} />
