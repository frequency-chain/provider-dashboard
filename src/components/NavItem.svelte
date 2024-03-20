<script lang="ts">
  export let href: string = '';
  export let isActive: boolean = false;
  export let onClick: () => void = () => {};
  export let id: string = '';
</script>

<a
  {id}
  {href}
  on:click={onClick}
  class={` flex h-[100px] items-center justify-center text-sm font-bold ${
    isActive && 'bg-bg-black-active shadow-blue-border'
  }`}
>
  <slot />
</a>
