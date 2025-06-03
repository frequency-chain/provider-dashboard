<script lang="ts">
  import { isLoggedIn } from '$lib/stores';
  import ConnectionStatus from './ConnectionStatus.svelte';
  import { Button, Assets } from '@frequency-chain/style-guide';
</script>

<header class="mb-8 flex items-start justify-between gap-3">
  <div>
    <Assets.FrequencyLogo class="w-[180px] max-w-[180px] pb-1 pl-3 md:min-w-40" />
    <p class="md:text-normal smText pl-3 font-semibold lg:tracking-wider">Provider Dashboard</p>
  </div>
  <ConnectionStatus />
  {#if !$isLoggedIn}
    <Button href="/faq" target="_self" intent="outlined-dark" size="small">&rarr; Questions?</Button>
  {/if}
</header>
