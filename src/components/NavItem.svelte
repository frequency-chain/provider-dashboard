<script lang="ts">
  export let href: string = '';
  export let isActive: boolean = false;
  export let onClick: () => void = () => {};
  export let id: string = '';
  export let target: string = '';
</script>

<a
  {id}
  {href}
  on:click={onClick}
  class={` flex h-[100px] items-center justify-center text-sm font-bold ${
    isActive && 'bg-cream text-teal shadow-blue-border'
  }`}
  {target}
>
  <slot />
</a>
