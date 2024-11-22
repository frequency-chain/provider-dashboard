<script lang="ts">
  import FrequencyLogo from './icons/FrequencyLogo.svelte';
  import ConnectionStatus from './ConnectionStatus.svelte';
  import { Button } from '@frequency-chain/style-guide';
</script>

<header class="mb-8 flex items-start justify-between">
  <div class="pt-3">
    <div class="w-[140px] max-w-48 pb-1 pl-3 md:min-w-40">
      <FrequencyLogo />
    </div>
    <p class="pl-3 text-normal font-semibold md:text-md lg:tracking-wider">Provider Dashboard</p>
  </div>
  <div class="md:w-f192 my-auto min-w-f120">
    <Button href="/faq" target="_self" class="px-2 py-f8 text-sm sm:p-f12 md:text-normal">&rarr; Questions?</Button>
  </div>
  <ConnectionStatus />
</header>
