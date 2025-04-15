<script lang="ts">
  import { isLoggedIn } from '$lib/stores';
  import FrequencyLogo from './icons/FrequencyLogo.svelte';
  import ConnectionStatus from './ConnectionStatus.svelte';
  import { Button } from '@frequency-chain/style-guide';
</script>

<header class="mb-8 flex items-start justify-between gap-3">
  <div>
    <div class="w-[180px] max-w-[180px] pb-1 pl-3 md:min-w-40">
      <FrequencyLogo />
    </div>
    <p class="md:text-normal pl-3 text-sm font-semibold lg:tracking-wider">Provider Dashboard</p>
  </div>
  <ConnectionStatus />
  {#if !$isLoggedIn}
    <Button href="/faq" target="_self" class="py-f8 sm:p-f12 md:text-normal px-2 text-sm">&rarr; Questions?</Button>
  {/if}
</header>
