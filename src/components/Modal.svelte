<script lang="ts">
  interface Props {
    id: string;
    close?: () => void;
    isOpen?: boolean;
    title?: import('svelte').Snippet;
    body?: import('svelte').Snippet;
  }

  let { id, close = () => {}, isOpen = false, title, body }: Props = $props();
</script>

{#if isOpen}
  <div
    {id}
    onclick={close}
    onkeyup={close}
    role="button"
    tabindex="0"
    class="fixed top-0 right-0 z-[100] flex h-[100vh] w-[calc(100vw-128px)] cursor-default items-center justify-center overflow-y-auto bg-black/25"
  >
    <div
      class="content-block w-modal flex cursor-default flex-col bg-white shadow-lg"
      onclick={(e) => e.stopPropagation()}
      onkeyup={(e) => e.stopPropagation()}
      tabindex="0"
      role="button"
    >
      <h2 class="section-title-underlined">{@render title?.()}</h2>
      {@render body?.()}
    </div>
  </div>
{/if}
