<script lang="ts">
  import switchIcon from '$lib/assets/switch.png';
  import ConnectProvider from './ConnectProvider.svelte';
  import { user } from '$lib/stores/userStore';
  import { isLoggedIn } from '$lib/stores';

  $: showConnectProvider = false;
</script>

{#if $isLoggedIn}
  <div class="flex items-center gap-6">
    <!-- {#if connected} -->
    <!-- TODO: ADD REAL DATA WHEN STORE IS CONNECTED -->
    <div class="flex items-center gap-2">
      <div class="w-1 h-1 rounded-full bg-green-success p-1" />
      <p class="text-md uppercase">{$user.network?.name}</p>
    </div>
    <p class="text-md">
      {#if $user?.network}{$user.network.endpoint?.toString().replace(/\/$/, '')}{/if}
    </p>

    <!-- TODO: CHANGE ICON WHEN APPROVED -->
    <!-- TODO: ADD ONCLICK WHEN BUILDING SWITCH MODAL -->
    <button
      on:click={() => (showConnectProvider = true)}
      class="flex h-[40px] w-[40px] items-center justify-center rounded-md bg-green drop-shadow"
      ><img src={switchIcon} alt="switch" class="w-[24px]" /></button
    >

    {#if showConnectProvider}
      <ConnectProvider close={() => (showConnectProvider = false)} />
    {/if}
    <!-- {/if} -->
  </div>
{/if}
