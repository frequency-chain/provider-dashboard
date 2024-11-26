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
  onclick={onClick}
  class={` flex h-[100px] items-center justify-center text-sm font-bold ${
    isActive && 'bg-white text-teal shadow-blue-border shadow-teal'
  }`}
  {target}
>
  <slot />
</a>
