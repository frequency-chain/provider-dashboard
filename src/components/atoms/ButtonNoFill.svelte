<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLButtonElement> {
    href?: string;
    children?: import('svelte').Snippet;
  }

  let { href, children, ...rest }: Props = $props();
</script>

{#if href}
  <a {href} class={cn('hover:text-teal underline; cursor-pointer text-sm', rest.class)}>
    {@render children?.()}
  </a>
{:else}
  <button {...rest} class={cn('hover:text-teal underline; cursor-pointer text-sm', rest.class)}>
    {@render children?.()}
  </button>
{/if}
