<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    href?: string;
    isActive?: boolean;
    onClick?: () => void;
    id?: string;
    target?: string;
    children: Snippet;
  }

  let { href = '', isActive = false, onClick = () => {}, id = '', target = '', children }: Props = $props();
</script>

<a
  {id}
  {href}
  onclick={onClick}
  class={` flex h-[100px] items-center justify-center text-sm font-bold ${
    isActive && 'bg-cream text-bright-blue shadow-blue-border'
  }`}
  {target}
>
  {@render children()}
</a>
