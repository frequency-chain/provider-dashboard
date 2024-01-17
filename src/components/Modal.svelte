<script lang="ts">
  export let close = () => {};
</script>

<div
  on:click={close}
  on:keyup={close}
  role="button"
  tabindex="0"
  class="fixed right-0 top-0 z-[100] flex h-[100vh] w-[calc(100vw-126px)] cursor-default items-center justify-center bg-overlay"
>
  <div
    class="content-block w-modal cursor-default"
    on:click|stopPropagation={() => {}}
    on:keyup|stopPropagation={() => {}}
    tabindex="0"
    role="button"
  >
    <slot />
  </div>
</div>
