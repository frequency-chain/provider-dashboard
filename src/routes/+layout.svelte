<script lang="ts">
  import Header from '../components/Header.svelte';
  import Nav from '../components/Nav.svelte';
  import wave from '$lib/assets/bg-wave.png';
  import { logInPromise, dotApi, storeChainInfo } from '$lib/stores';
  import { getToken } from '$lib/polkadotApi';
  import { getBlockNumber, getEpoch } from '$lib/connections';

  $: $logInPromise;

  $: {
    $dotApi?.api?.rpc.system.properties().then((chain) => {
      if ($dotApi?.api && chain) {       
        const token = getToken(chain);
        Promise.all([getBlockNumber($dotApi.api), getEpoch($dotApi.api)])
          .then(([blockNumber, epochNumber]) => {
            storeChainInfo.set({ connected: true, blockNumber, epochNumber, token });
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  }
</script>

<div>
  <img alt="The project logo" src={wave} class="fixed right-0 top-0 z-[-1] w-[100%]" />
  <div class="flex">
    <Nav />
    <div class="m-6 w-[100%] pl-[126px]">
      <Header />
      <div class="flex items-center justify-center">
        <slot />
      </div>
    </div>
  </div>
</div>
;
