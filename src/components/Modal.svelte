<script lang="ts">
  export let close = () => {};
</script>

<div
  on:click={close}
  on:keyup={close}
  role="button"
  tabindex="0"
  class="cursor-default fixed z-[100] w-[calc(100vw-126px)] h-[100vh] bg-overlay right-0 top-0 flex items-center justify-center"
>
  <div
    class="cursor-default content-block w-modal"
    on:click|stopPropagation={() => {}}
    on:keyup|stopPropagation={() => {}}
    tabindex="0"
    role="button"
  >
    <slot />
  </div>
</div>
