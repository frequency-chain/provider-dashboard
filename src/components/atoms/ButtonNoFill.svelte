<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
    href?: string;
    children?: import('svelte').Snippet;
  }

  let { href, children, ...rest }: Props = $props();
</script>

{#if href}
  <a {...rest} {href} class={cn('hover:text-primary smText cursor-pointer underline', rest.class)}>
    {@render children?.()}
  </a>
{:else}
  <button {...rest} class={cn('hover:text-primary smText cursor-pointer underline', rest.class)}>
    {@render children?.()}
  </button>
{/if}
