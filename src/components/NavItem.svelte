<script lang="ts">
  interface Props {
    href: string;
    isActive: boolean;
    onClick: () => void;
    id: string;
    target: string;
  }

  let { href = '', isActive = false, onClick = () => {}, id = '', target = '' }: Props = $props();
</script>

<a
  {id}
  {href}
  on:click={onClick}
  class={` flex h-[100px] items-center justify-center text-sm font-bold ${
    isActive && 'bg-cream text-bright-blue shadow-blue-border'
  }`}
  {target}
>
  <slot />
</a>
