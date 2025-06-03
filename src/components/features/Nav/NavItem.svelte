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
  class={`hover:text-secondary smText flex h-[100px] items-center justify-center font-bold ${
    isActive && 'text-primary bg-white shadow-[8px_0_rgba(121,14,112,1)]'
  } ${rest.class}`}
  {target}
>
  {@render children?.()}
</a>
