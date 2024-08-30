<script lang="ts">
  import Header from '../components/Header.svelte';
  import Nav from '../components/Nav.svelte';
  import Wave from '../components/Wave.svelte';
  import { logInPromise, dotApi, storeChainInfo } from '$lib/stores';
  import { getToken } from '$lib/polkadotApi';
  import { getBlockNumber, getEpoch } from '$lib/connections';

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
  <div class="fixed right-0 top-[10%] z-[-1] w-[100%] opacity-60">
    <Wave />
  </div>
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
