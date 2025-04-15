<script lang="ts">
  export let id: string;
  export let close = () => {};
  export let isOpen: boolean = false;
</script>

{#if isOpen}
  <div
    {id}
    on:click={close}
    on:keyup={close}
    role="button"
    tabindex="0"
    class="bg-opacity-25 fixed top-0 right-0 z-100 flex h-[100vh] w-[calc(100vw-142px)] cursor-default items-center justify-center overflow-y-auto bg-black"
  >
    <div
      class="content-block w-modal flex cursor-default flex-col bg-white shadow-lg"
      on:click|stopPropagation={() => {}}
      on:keyup|stopPropagation={() => {}}
      tabindex="0"
      role="button"
    >
      <h2 class="section-title-underlined"><slot name="title" /></h2>
      <slot name="body" />
    </div>
  </div>
{/if}
