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
</script>

<div class="pt-8">
  <p class="text-2xl"><label for="provider-list">Select a Network</label></p>
  <select
    id="provider-list"
    required
    bind:value={selectedProvider}
    class="text-left bg-green5 pr-8 pl-4 py-2 rounded-md border-0"
  >
    {#each Object.keys(ProviderMap) as providerName}
      <option value={providerName} class="bg-base">{providerName}: {ProviderMap[providerName]}</option>
    {/each}
  </select>
  <input
    type="text"
    id="other-endpoint-url"
    placeholder="wss://some.frequency.node"
    bind:value={otherProvider}
    disabled={selectedProvider.toString() != 'Other'}
    class:hidden={selectedProvider.toString() != 'Other'}
    class="w-500 border-silver rounded text-white bg-white-transparent"
  />
  <button
    on:click|preventDefault={async () => await connect()}
    id="connect-button"
    hidden={!canConnect}
    class="btn-primary ml-4 select-none"
  >
    Connect to {selectedProvider}
  </button>
</div>
<p class="text-sm pt-4 underline cursor-pointer font-light">
    <a id="here" href="#here" on:click|preventDefault={toggleExplain} on:keydown|preventDefault={toggleExplain}
    >What's the difference between Mainnet and Testnet (Rococo)?</a
    >
  </p>
<div class:hidden={!showExplainer} class="pt-4">
  <p>The Frequency Mainnet is the production Frequency blockchain network.</p>
  <p>
    The Frequency Rococo Testnet, which works with the Polkadot Rococo Testnet, is for developers to test and debug
    applications without risking real assets.
  </p>
  <h3 class="text-lg pt-4 pb-2">
    <strong>What about the other options?</strong>
  </h3>
  <p>To connect to a node running on your desktop, choose <span class="font-bold text-aqua">Localhost.</span></p>
  <p>
    To connect to a node that is not in the list, choose <span class="font-bold text-aqua">Other</span>, then type the
    desired WebSocket address in the text field.
  </p>
  <button on:click={toggleExplain} on:keydown={toggleExplain} class="btn-primary select-none">Okay</button>
</div>

<div class:hidden={connected} class="pt-8 color-inherit">
  <div hidden={selectedProvider !== 'Rococo' || !showFaucetInstructions}>
    <p class="pl-8 color-inherit">
      To transact on Frequency as a provider you will need frequency utility tokens. On Frequency testnet, you can get
      tokens from the Testnet Faucet. To do that:
    </p>
    <ol class="list-disc pl-12">
      <li>
        <a href="https://faucet.rococo.frequency.xyz/" target="_blank" class="underline">
          Get XRQCY tokens for Frequency Testnet (Rococo)
        </a> and follow the instructions using your desired wallet address to get XRQCY tokens.
      </li>
      <li>
        Once that succeeds, verify the tokens have made it to your wallet by selecting or re-selecting the address
        above. You may need to wait a minute.
      </li>
      <li>
        For more information, you can also visit the
        <a href="https://cloudflare-ipfs.com/ipns/dotapps.io/#/accounts" class="underline">
          Rococo Accounts page via the Polkadot UI.
        </a>
      </li>
    </ol>
    <button on:click|preventDefault={toggleFaucetInstructions} class="btn-primary ml-8 select-none"> I have token</button>
  </div>
</div>
