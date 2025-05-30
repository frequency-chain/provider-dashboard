<script lang="ts">
  import NavItem from './NavItem.svelte';
</script>

{#snippet navItem(label: string, link: string)}
  <NavItem class="py-f8 h-auto" href={link} target="_blank">{label}</NavItem>
{/snippet}

<div class="pb-f40 pt-f8 border-t">
  {@render navItem('Provider Rewards', 'https://rewards.frequency.xyz/providers/')}
  {@render navItem('Testnet Faucet', 'https://faucet.testnet.frequency.xyz/')}
</div>
