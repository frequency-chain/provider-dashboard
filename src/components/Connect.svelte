<script lang="ts">
  import { onMount } from 'svelte';
  import { storeConnected, dotApi, storeMsaInfo } from '$lib/stores';
  import { defaultDotApi } from '$lib/storeTypes';
  import { ProviderMap } from '$lib/connections';
  import { getApi, loadAccounts, updateConnectionStatus } from '$lib/polkadotApi';

  import type { ApiPromise, WsProvider } from '@polkadot/api';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

  let wsProvider: WsProvider;
  let thisWeb3Enable: typeof web3Enable;
  let thisWeb3Accounts: typeof web3Accounts;

  let showFaucetInstructions = true;
  const toggleFaucetInstructions = (_evt: Event) => {
    showFaucetInstructions = !showFaucetInstructions;
  };
  let connected = false;
  let thisDotApi = defaultDotApi;

  onMount(async () => {
    // This must be in onMount because the extension requires that you have a window to attach to.
    // Since this project is precompiled, there will be no window until onMount
    const polkadotExt = await import('@polkadot/extension-dapp');
    thisWeb3Enable = polkadotExt.web3Enable;
    thisWeb3Accounts = polkadotExt.web3Accounts;
  });

  let selectedProvider: string = 'Rococo';
  let otherProvider: string;
  let showExplainer = false;

  const toggleExplain = (evt: Event) => {
    showExplainer = !showExplainer;
  };

  // Add Reactive statement to enable/disable the connect button when the selectedProvider changes.
  let canConnect = false;
  $: canConnect = selectedProvider !== '' || otherProvider !== '';

  storeConnected.subscribe((val) => (connected = val));
  dotApi.subscribe((api) => (thisDotApi = api));

  async function connect() {
    let selectedProviderURI: string = '';
    if (selectedProvider === 'Other') {
      selectedProviderURI = otherProvider;
    } else {
      selectedProviderURI = ProviderMap[selectedProvider];
    }
    storeMsaInfo.set({ isProvider: false, msaId: 0, providerName: '' });
    try {
      await getApi(selectedProviderURI, thisDotApi, wsProvider);
      await loadAccounts(selectedProviderURI, selectedProvider, thisWeb3Enable, thisWeb3Accounts);
      await updateConnectionStatus(thisDotApi.api as ApiPromise);
    } catch (e: any) {
      console.error('Error: ', e);
      alert(
        `could not connect to ${
          selectedProviderURI || 'empty value'
        }. Please enter a valid and reachable Websocket URL.`
      );
    } finally {
      if (thisDotApi.api?.isConnected) {
        // Disable connect button
        canConnect = false;
        console.log('Connected to ', selectedProviderURI);
      }
    }
    return;
  }
  let networkQuestion = "What's the difference between Mainnet and Testnet (Rococo)?";
</script>

<h3 class="text-lg pt-8">
  <a
  id="here"
  href="#here"
  on:click|preventDefault={toggleExplain}
  on:keydown|preventDefault={toggleExplain}
  class:hidden={showExplainer}
  class="explainer-text">{networkQuestion}</a
></h3>
<div class:hidden={!showExplainer} class="pt-4">
  <p>The main purpose of the Mainnet is to run the actual blockchain network.</p>
  <p>
    The Testnet, which works with the Rococo Polkadot Testnet, is designed for
    developers to test and debug their applications without risking real assets.
  </p>
  <h3 class="text-lg pt-4 pb-2">
    <strong>What about the other options?</strong>
  </h3>
  <p>If you need to connect a node running development code locally, choose Localhost.</p>
  <p>
    If you need to connect to a node that is not in the list, choose Other, then type
    the WebSocket address in the text
    field.
  </p>
  <button on:click={toggleExplain} on:keydown={toggleExplain}
          class="mt-6 px-8 p-2 rounded-2xl text-white border-black bg-cobalt">
  >Thanks.</button>
</div>

<div class="pt-8">
  <label for="provider-list">1. Select a Network</label>
  <select id="provider-list" required bind:value={selectedProvider} class="text-left bg-green5 pr-8 pl-4 py-2 rounded-md border-0">
    {#each Object.keys(ProviderMap) as providerName}
      <option value={providerName} class="bg-base">{providerName}: {ProviderMap[providerName]}</option>
    {/each}
  </select>
  <input
          type="text"
          id="other-endpoint-url"
          placeholder="wss://some.frequency.node"
          bind:value={otherProvider}
          class:hidden={selectedProvider.toString() != 'Other'}
          class="w-80 rounded-md"
  />
</div>
<div class={connected ? '' : 'hidden'}>
  <div hidden={selectedProvider !== 'Rococo' || !showFaucetInstructions}>
    <p class="pl-8">
      To transact on Frequency as a provider you will need frequency utility tokens. On Frequency testnet, you can get
      tokens from the Testnet Faucet. To do that:
    </p>
    <ol class="list-disc pl-12">
      <li>
        Go to <a href="https://faucet.rococo.frequency.xyz/" target="_blank">
          to get XRQCY tokens for Frequency Testnet (Rococo)
        </a> and follow the instructions using your desired wallet address to get XRQCY tokens.
      </li>
      <li>
        Once that succeeds, verify the tokens have made it to your wallet by selecting or re-selecting the address
        above. You may need to wait a minute.
      </li>
      <li>
        For more information, you can also visit the <a href="https://cloudflare-ipfs.com/ipns/dotapps.io/#/accounts"
          >Rococo Accounts page via the Polkadot UI</a
        >.
      </li>
    </ol>
    <button on:click|preventDefault={toggleFaucetInstructions}
            class="mt-6 ml-8 px-8 p-2 rounded-2xl text-white border-black bg-cobalt">
      I have token</button>
  </div>
</div>
<div>
  <button on:click|preventDefault={async () => await connect()} id="connect-button" hidden={!canConnect}
          class="mt-6 px-8 p-2 rounded-2xl text-white border-black bg-cobalt">
    Connect to {selectedProvider}
  </button>
</div>
