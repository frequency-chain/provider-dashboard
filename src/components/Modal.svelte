<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    id: string;
    close: () => void;
    isOpen: boolean;
    children: Snippet;
  }

  let { title, id, close, isOpen = false, children }: Props = $props();

  function handleStopProp(e: Event) {
    e.stopPropagation();
  }
</script>

{#if isOpen}
  <div
    {id}
    onclick={close}
    onkeyup={close}
    role="button"
    tabindex="0"
    class="fixed right-0 top-0 z-[100] flex h-[100vh] w-[calc(100vw-126px)] cursor-default items-center justify-center overflow-y-auto bg-overlay"
  >
    <div
      class="content-block flex w-modal cursor-default flex-col gap-7"
      onclick={handleStopProp}
      onkeyup={handleStopProp}
      tabindex="0"
      role="button"
    >
      <h2 class="section-title-underlined">{title}</h2>
      {@render children()}
    </div>
  </div>
{/if}
