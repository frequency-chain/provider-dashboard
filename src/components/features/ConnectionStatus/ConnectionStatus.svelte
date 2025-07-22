<script lang="ts">
  import Switch from '$lib/assets/Switch.svelte';
  import ConnectProvider from './ConnectProvider.svelte';
  import { user } from '$lib/stores/userStore';
  import { isLoggedIn, storeChainInfo } from '$lib/stores';
  import { IconButton } from '@frequency-chain/style-guide';

  let showConnectProvider = $state(false);
</script>

{#if $isLoggedIn}
  <div class="flex flex-col">
    <div class="border-divider border-l pl-5 md:min-w-[300px]"></div>
    <div class="mdText border-divider flex items-baseline justify-between border-b pb-3 font-bold">
      <div>Connection Status</div>
      <IconButton label="switch button" onclick={() => (showConnectProvider = true)}><Switch /></IconButton>
    </div>

    <div class="gap-f8 pt-f12 flex flex-col">
      <div class="flex items-center gap-2 md:ml-2 lg:ml-0">
        {#if $storeChainInfo.connected}
          <div class="bg-success h-[6px] w-[6px] rounded-full p-[6px]"></div>
        {:else}
          <div class="bg-red-error h-[6px] w-[6px] rounded-full p-[6px]"></div>
        {/if}
        <p id="connected-network" class="md:text-normal lg:mdText smText uppercase">{$user.network?.name}</p>
      </div>

      <p class="md:text-normal lg:mdText smText">
        {#if $user?.network}{$user.network.endpoint?.toString().replace(/\/$/, '')}{/if}
      </p>
    </div>

    <ConnectProvider close={() => (showConnectProvider = false)} isOpen={showConnectProvider} />
  </div>
{/if}
