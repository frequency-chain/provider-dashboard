<script lang="ts">
  import Header from '../components/Header.svelte';
  import Nav from '../components/Nav.svelte';
  import { logInPromise, dotApi, storeChainInfo } from '$lib/stores';
  import { getToken } from '$lib/polkadotApi';
  import { getBlockNumber, getEpoch } from '$lib/connections';
  import Footer from '$components/Footer.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  $effect(() => {
    $logInPromise.then(() => {
      console.log('Set login in promise');
    });
  });

  $effect(() => {
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
  });
</script>

<div>
  <div class="flex flex-col">
    <Nav />
    <div class="main-section my-6">
      <Header />
      <div class="mx-auto max-w-[80%] px-0 lg:max-w-[1024px]">
        {@render children?.()}
      </div>
    </div>
  </div>
  <div class="main-section mt-f16 md:mt-f96">
    <Footer />
  </div>
</div>
