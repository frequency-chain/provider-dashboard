<script lang="ts">
  interface Props {
    href?: string;
    isActive?: boolean;
    onClick?: () => void;
    id?: string;
    target?: string;
    children?: import('svelte').Snippet;
  }

  let { href = '', isActive = false, onClick = () => {}, id = '', target = '', children }: Props = $props();
</script>

<a
  {id}
  {href}
  onclick={onClick}
  class={` flex h-[100px] items-center justify-center text-sm font-bold ${
    isActive && 'text-teal shadow-blue-border shadow-teal bg-white'
  }`}
  {target}
>
  {@render children?.()}
</a>
