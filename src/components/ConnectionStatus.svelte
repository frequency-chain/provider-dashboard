<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

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
        <div class="w-1 h-1 rounded-full bg-success p-1"></div>
      {:else}
        <div class="w-1 bg-red-error h-1 rounded-full p-1"></div>
      {/if}
      <p id="connected-network" class="text-sm uppercase md:text-normal lg:text-md">{$user.network?.name}</p>
    </div>
    <div class="flex items-center justify-between gap-2">
      <p class="text-sm md:text-normal lg:text-md">
        {#if $user?.network}{$user.network.endpoint?.toString().replace(/\/$/, '')}{/if}
      </p>
      <div class="rounded-md transition hover:shadow-md">
        <button
          onclick={preventDefault(() => {
            showConnectProvider = true;
          })}
          class="w-f32 flex h-f32 min-h-f32 min-w-f32 items-end justify-center rounded-md bg-teal p-1 lg:min-h-f40 lg:min-w-f40"
          ><Switch />
        </button>
      </div>
      <ConnectProvider close={() => (showConnectProvider = false)} isOpen={showConnectProvider} />
    </div>
  </div>
{/if}
