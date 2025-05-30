<script lang="ts">
  import Switch from '$lib/assets/Switch.svelte';
  import ConnectProvider from './ConnectProvider.svelte';
  import { user } from '$lib/stores/userStore';
  import { isLoggedIn, storeChainInfo } from '$lib/stores';
  import { IconButton } from '@frequency-chain/style-guide';

  let showConnectProvider = $state(false);
</script>

{#if $isLoggedIn}
  <div class="flex flex-col gap-2 md:flex-row md:gap-6">
    <div class="flex items-center gap-2 md:ml-2 lg:ml-0">
      {#if $storeChainInfo.connected}
        <div class="bg-success h-1 w-1 rounded-full p-1"></div>
      {:else}
        <div class="bg-red-error h-1 w-1 rounded-full p-1"></div>
      {/if}
      <p id="connected-network" class="md:text-normal lg:mdText text-sm uppercase">{$user.network?.name}</p>
    </div>
    <div class="flex items-center justify-between gap-2">
      <p class="md:text-normal lg:mdText text-sm">
        {#if $user?.network}{$user.network.endpoint?.toString().replace(/\/$/, '')}{/if}
      </p>
      <IconButton label="switch button" onclick={() => (showConnectProvider = true)}><Switch /></IconButton>
      <ConnectProvider close={() => (showConnectProvider = false)} isOpen={showConnectProvider} />
    </div>
  </div>
{/if}
