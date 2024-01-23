<script lang="ts">
  import { onMount } from 'svelte';

  import type { WsProvider, ApiPromise } from '@polkadot/api';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
  import { dotApi, isLoggedIn, transactionSigningAddress } from '$lib/stores';

  import { defaultDotApi } from '$lib/storeTypes';

  import DropDownMenu from '$components/DropDownMenu.svelte';
  import BlockSection from '$components/BlockSection.svelte';
  import Button from '$components/Button.svelte';
  import { pageContent } from '$lib/stores/pageContentStore';
  import { Network, allNetworks, networkToInfo, selectedNetwork } from '$lib/stores/networksStore';
  import { getApi, updateConnectionStatus } from '$lib/polkadotApi';
  import { fetchAccounts, storeProviderAccounts } from '$lib/stores/accountsStore';

  let wsProvider: WsProvider;
  let thisWeb3Enable: typeof web3Enable;
  let thisWeb3Accounts: typeof web3Accounts;

  let networks = allNetworks();

  let selectedNetworkAsString: string = '';
  let customNetwork: string = '';

  let thisDotApi = defaultDotApi;
  dotApi.subscribe((api) => (thisDotApi = api));

  let selectedAccountAsString: string = '';
  let providerAccounts: Record<string, string> = {};

  let canConnect = false;
  $: canConnect = selectedNetworkAsString !== '' && selectedAccountAsString !== '';

  // We need to access the user's wallet to get the accounts
  onMount(async () => {
    // This must be in onMount because the extension requires that you have a window to attach to.
    // Since this project is precompiled, there will be no window until onMount
    const polkadotExt = await import('@polkadot/extension-dapp');
    thisWeb3Enable = polkadotExt.web3Enable;
    thisWeb3Accounts = polkadotExt.web3Accounts;
  });

  selectedNetwork.subscribe(async (network) => {
    console.log('selectedNetwork changed to ' + network);
    if (network != undefined && network != Network.NONE) {
      let info = networkToInfo[network];
      console.dir(info);
      let endpoint = networkToInfo[network].endpoint;
      console.log('endpoint: ' + endpoint);
      try {
        await getApi(endpoint?.toString() ?? '', thisDotApi, wsProvider);
        await fetchAccounts(network, thisWeb3Enable, thisWeb3Accounts, thisDotApi.api as ApiPromise);
        await updateConnectionStatus(thisDotApi.api as ApiPromise);
      } catch (e) {
        console.log(e);
        alert(
          `could not connect to ${
            endpoint?.toString() || 'empty value'
          }. Please enter a valid and reachable Websocket URL.`
        );
      }
    }
  });

  storeProviderAccounts.subscribe((accounts) => {
    console.log('storeProviderAccounts changed');
    console.dir(accounts);
    providerAccounts = Object.fromEntries(Object.entries(accounts).map(([key]) => [key, key]));
  });

  function connect() {
    $isLoggedIn = true;
    pageContent.dashboard();
  }

  function becomeProvider() {
    pageContent.becomeProvider();
  }

  function networkChanged() {
    console.log('networkChanged');
    console.log('selectedNetworkAsString: ' + selectedNetworkAsString);
    $selectedNetwork = selectedNetworkAsString as Network;
  }

  function accountChanged() {
    console.log('accountChanged');
    console.log('selectedAccountAsString: ' + selectedAccountAsString);
    transactionSigningAddress.set(selectedAccountAsString);
  }
</script>

<div id="provider-login" class="content-block w-single-block flex flex-col gap-4">
  <BlockSection title="Connect Provider">
    <DropDownMenu
      id="network"
      label="Select a Network"
      bind:action={selectedNetworkAsString}
      onChange={networkChanged}
      placeholder=""
      options={networks}
    ></DropDownMenu>
    <input
      type="text"
      id="other-endpoint-url"
      placeholder="wss://some.frequency.node"
      bind:value={customNetwork}
      disabled={$selectedNetwork != Network.CUSTOM}
      class:hidden={$selectedNetwork != Network.CUSTOM}
    />
    <DropDownMenu
      id="controlkeys"
      label="Select a Provider Control Key"
      bind:action={selectedAccountAsString}
      onChange={accountChanged}
      placeholder=""
      options={providerAccounts}
    ></DropDownMenu>
    <div class="flex justify-between items-end">
      <Button id="connect-button" title="Connect" disabled={!canConnect} action={connect}></Button>
      <div
        style="color: #FFFFFF; font-size: 12px; font-family: Poppins; font-weight: 400; text-decoration: underline; line-height: 18px; word-wrap: break-word"
      >
        Cancel
      </div>
    </div>
  </BlockSection>
</div>
