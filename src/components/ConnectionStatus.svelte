<script lang="ts">
  import switchIcon from '$lib/assets/switch.png';
  import ConnectProvider from './ConnectProvider.svelte';
  import { user } from '$lib/stores/userStore';
  import { isLoggedIn, storeChainInfo } from '$lib/stores';

  $: showConnectProvider = false;
</script>

{#if $isLoggedIn}
  <div class="flex items-center gap-6">
    <div class="flex items-center gap-2">
      {#if $storeChainInfo.connected}
        <div class="w-1 h-1 rounded-full bg-success p-1" />
      {:else}
        <div class="w-1 bg-red-error h-1 rounded-full p-1" />
      {/if}
      <p id="connected-network" class="text-md uppercase">{$user.network?.name}</p>
    </div>
    <p class="text-md">
      {#if $user?.network}{$user.network.endpoint?.toString().replace(/\/$/, '')}{/if}
    </p>
    <button
      on:click|preventDefault={() => {
        showConnectProvider = true;
      }}
      class="flex h-[40px] w-[40px] items-center justify-center rounded-md bg-green drop-shadow"
      ><img src={switchIcon} alt="switch" class="w-[24px]" />
    </button>
    <ConnectProvider close={() => (showConnectProvider = false)} isOpen={showConnectProvider} />
  </div>
{/if}
