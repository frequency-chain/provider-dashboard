<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLAnchorElement> {
    href?: string;
    isActive?: boolean;
    onClick?: () => void;
    id?: string;
    target?: string;
    children?: import('svelte').Snippet;
  }

  let { href = '', isActive = false, onClick = () => {}, id = '', target = '', children, ...rest }: Props = $props();
</script>

<a
  {id}
  {href}
  onclick={onClick}
  class={`hover:text-teal flex h-[100px] items-center justify-center text-sm font-bold ${
    isActive && 'text-teal shadow-blue-border shadow-teal bg-white'
  } ${rest.class}`}
  {target}
>
  {@render children?.()}
</a>
