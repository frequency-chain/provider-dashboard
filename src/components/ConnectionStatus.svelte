<script lang="ts">
  import { Network, allNetworks, networkToInfo, selectedNetwork } from '$lib/stores/networksStore';
  import networkSwitchIcon from '$lib/assets/switch-network.svg';
  import { isLoggedIn } from '$lib/stores';

  let networkName:string | undefined;
  let networkEndpointURL:string | undefined;
  selectedNetwork.subscribe(value => {
    networkName = networkToInfo[value].name;
    networkEndpointURL = networkToInfo[value].endpoint?.toString()?.replace(/\/$/, '');
    });

</script>

<div class="flex gap-6 items-center" class:hidden={!$isLoggedIn}>
  <!-- {#if connected} -->
  <!-- TODO: ADD REAL DATA WHEN STORE IS CONNECTED -->
  <div class="flex gap-2 items-center">
    <div class="bg-red-error h-1 w-1 p-1 rounded-full" />
    <p class="text-md uppercase">{networkName}</p>
  </div>
  <p class="text-md">{networkEndpointURL}</p>

  <!-- TODO: CHANGE ICON WHEN APPROVED -->
  <!-- TODO: ADD ONCLICK WHEN BUILDING SWITCH MODAL -->
  <div style="width: 100%; height: 100%; background: #6EE9D1; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 5px"><img src={networkSwitchIcon} alt="Switch Network" /></div>
  
  <button on:click={() => {}}>
    
  </button>
  <!-- {/if} -->
</div>
