<script lang="ts">
  import Switch from '$lib/assets/Switch.svelte';
  import ConnectProvider from './ConnectProvider.svelte';
  import { user } from '$lib/stores/userStore';
  import { isLoggedIn, storeChainInfo } from '$lib/stores';

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
      <p id="connected-network" class="md:text-normal lg:text-md text-sm uppercase">{$user.network?.name}</p>
    </div>
    <div class="flex items-center justify-between gap-2">
      <p class="md:text-normal lg:text-md text-sm">
        {#if $user?.network}{$user.network.endpoint?.toString().replace(/\/$/, '')}{/if}
      </p>
      <div class="rounded-md transition hover:shadow-md">
        <button
          onclick={() => (showConnectProvider = true)}
          class="w-f32 h-f32 min-h-f32 min-w-f32 bg-teal p-f8 flex items-end justify-center rounded-md"
          ><Switch />
        </button>
      </div>
      <ConnectProvider close={() => (showConnectProvider = false)} isOpen={showConnectProvider} />
    </div>
  </div>
{/if}
