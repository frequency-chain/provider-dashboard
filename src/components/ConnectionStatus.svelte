<script lang="ts">
  import { Network, allNetworks, networkToInfo, selectedNetwork } from '$lib/stores/networksStore';
  import networkSwitchIcon from '$lib/assets/switch-network.svg';
  import { isLoggedIn } from '$lib/stores';
  import { pageContent } from '$lib/stores/pageContentStore';

  let networkName: string | undefined;
  let networkEndpointURL: string | undefined;
  selectedNetwork.subscribe((value) => {
    networkName = networkToInfo[value].name;
    networkEndpointURL = networkToInfo[value].endpoint?.toString()?.replace(/\/$/, '');
  });

  function switchNetwork() {
    console.log('switchNetwork');
    pageContent.reconnect();
  }
</script>

<div class="flex gap-6 items-center" class:hidden={!$isLoggedIn}>
  <!-- {#if connected} -->
  <!-- TODO: ADD REAL DATA WHEN STORE IS CONNECTED -->
  <div class="flex gap-2 items-center">
    <div class="bg-green-success h-1 w-1 p-1 rounded-full" />
    <p class="text-md uppercase">{networkName}</p>
  </div>
  <p class="text-md">{networkEndpointURL}</p>

  <!-- TODO: CHANGE ICON WHEN APPROVED -->
  <!-- TODO: ADD ONCLICK WHEN BUILDING SWITCH MODAL -->
  <button
    on:click={switchNetwork}
    class="flex justify-center items-center select-none p-2 m-2 rounded-full shadow h-20 w-20 focus:outline-none focus:shadow-outline"
    style="width: 44px; height: 44px; background: #6EE9D1; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 5px"
    ><img class="" src={networkSwitchIcon} alt="Switch Network" /></button
  >
  <!-- {/if} -->
</div>
