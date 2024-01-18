<script lang="ts">
  import { onMount } from 'svelte';
  import { storeConnected, dotApi, storeMsaInfo } from '$lib/stores';
  import { defaultDotApi } from '$lib/storeTypes';

  import type { ApiPromise, WsProvider } from '@polkadot/api';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
  let wsProvider: WsProvider;
  let thisWeb3Enable: typeof web3Enable;
  let thisWeb3Accounts: typeof web3Accounts;

  import DropDownMenu from '$components/DropDownMenu.svelte';
  import BlockSection from '$components/BlockSection.svelte';
  import Button from '$components/Button.svelte';
  import { ProviderMap } from '$lib/connections';
  import { pageContent, storeProviderAccounts } from '$lib/stores';

  const networks = Object.entries(ProviderMap).reduce((acc: Record<string, string>, [key, value]) => {
    acc[key] = `${key}: ${value}`;
    return acc;
  }, {});

  let selectedProvider: string = 'Rococo';
  let otherProvider: string;

  let connected = false;
  let thisDotApi = defaultDotApi;

  // Add Reactive statement to enable/disable the connect button when the selectedProvider changes.
  let canConnect = false;
  $: canConnect = selectedProvider !== '' || otherProvider !== '';

  storeConnected.subscribe((val) => (connected = val));
  dotApi.subscribe((api) => (thisDotApi = api));

  onMount(async () => {
    // This must be in onMount because the extension requires that you have a window to attach to.
    // Since this project is precompiled, there will be no window until onMount
    const polkadotExt = await import('@polkadot/extension-dapp');
    thisWeb3Enable = polkadotExt.web3Enable;
    thisWeb3Accounts = polkadotExt.web3Accounts;
  });

  function connect() {
    console.log($storeProviderAccounts);
  }

  function becomeProvider() {
    pageContent.becomeProvider();
  }

  $: if (selectedProvider) {
    console.log(selectedProvider);
  }
</script>

<div class="content-block w-single-block flex flex-col gap-4">
  <BlockSection title="Provider Login">
    <DropDownMenu label="Select a Network" bind:selectedValue={selectedProvider} placeholder="" options={networks}
    ></DropDownMenu>
    <DropDownMenu label="Select a Provider Control Key" placeholder="" options={ProviderMap}></DropDownMenu>
    <Button title="Connect" action={connect}></Button>
  </BlockSection>

  <BlockSection title="Not a Provider?">
    <div class="text-sm">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
      aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
    <Button title="Become a Provider" action={becomeProvider}></Button>
  </BlockSection>

  <div class="text-xs mt-24">
    To transact on Frequency as a provider you will need frequency utility tokens. On Frequency testnet, you can get
    tokens from the Testnet Faucet. To do that: Get XRQCY tokens for Frequency Testnet (Rococo) and follow the
    instructions using your desired wallet address to get XRQCY tokens. Once that succeeds, verify the tokens have made
    it to your wallet by selecting or re-selecting the address above. You may need to wait a minute. For more
    information, you can also visit the Rococo Accounts page via the Polkadot UI.
  </div>
</div>
