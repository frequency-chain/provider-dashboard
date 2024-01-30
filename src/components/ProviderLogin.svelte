<script lang="ts">
  import { onMount } from 'svelte';

  import type { WsProvider, ApiPromise } from '@polkadot/api';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
  import { dotApi, isLoggedIn } from '$lib/stores';

  import { defaultDotApi } from '$lib/storeTypes';

  import DropDownMenu from '$components/DropDownMenu.svelte';
  import BlockSection from '$components/BlockSection.svelte';
  import Button from '$components/Button.svelte';
  import { pageContent } from '$lib/stores/pageContentStore';
  import { allNetworks, type NetworkInfo } from '$lib/stores/networksStore';
  import { getApi, updateConnectionStatus } from '$lib/polkadotApi';
  import { Account, fetchAccountsForNetwork, providerAccountsStore } from '$lib/stores/accountsStore';
  import { user } from '$lib/stores/userStore';

  let wsProvider: WsProvider;

  // Wallet access
  let thisWeb3Enable: typeof web3Enable;
  let thisWeb3Accounts: typeof web3Accounts;

  let selectedAccount: Account;
  let customNetwork: string;

  // Error messages
  let networkErrorMsg: string = '';
  let controlKeysErrorMsg: string = '';

  let thisDotApi = defaultDotApi;
  dotApi.subscribe((api) => (thisDotApi = api));

  // Control whether or not the connect button is enabled or disabled
  let canConnect: boolean = false;
  $: canConnect =
    $user?.network != null && Array.from($providerAccountsStore.keys()).length > 0 && $user?.address !== '';

  // We need to access the user's wallet to get the accounts
  onMount(async () => {
    // This must be in onMount because the extension requires that you have a window to attach to.
    // Since this project is precompiled, there will be no window until onMount
    const polkadotExt = await import('@polkadot/extension-dapp');
    thisWeb3Enable = polkadotExt.web3Enable;
    thisWeb3Accounts = polkadotExt.web3Accounts;
  });

  async function connectAndFetchAccounts(network: NetworkInfo | null): Promise<void> {
    if (network) {
      try {
        networkErrorMsg = '';
        controlKeysErrorMsg = '';
        $providerAccountsStore.clear();
        await getApi(network.endpoint?.toString() ?? '', thisDotApi, wsProvider);
        await fetchAccountsForNetwork(network, thisWeb3Enable, thisWeb3Accounts, thisDotApi.api as ApiPromise);
        await updateConnectionStatus(thisDotApi.api as ApiPromise);
      } catch (e) {
        console.log(e);
        networkErrorMsg = `Could not connect to ${
          network.endpoint?.toString() || 'empty value'
        }. Please enter a valid and reachable Websocket URL.`;
        console.error(networkErrorMsg);
      }
      for (const account of $providerAccountsStore) {
        console.log(`Found provider: ${account}`);
      }
      if (networkErrorMsg == '' && Array.from($providerAccountsStore.keys()).length == 0) {
        controlKeysErrorMsg = 'No provider accounts found.  Become a provider?';
      }
    }
  }

  function connect() {
    $isLoggedIn = true;
    pageContent.dashboard();
  }

  function becomeProvider() {
    pageContent.becomeProvider();
  }

  function networkChanged() {
    console.log('networkChanged');
    $user.address = '';
    if ($user.network && $user.network.endpoint && isValidURL($user.network.endpoint.toString())) {
      connectAndFetchAccounts($user.network);
    }
    canConnect = false;
  }

  function accountChanged() {
    console.log('accountChanged');

    $user = selectedAccount;
  }

  function isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  function customNetworkChanged(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (isValidURL(customNetwork)) {
        const url = new URL(customNetwork);
        if ($user?.network) {
          $user.network.endpoint = url;
        }
      }
    }
  }

  function formatNetwork(network: NetworkInfo): string {
    if (network.name === 'CUSTOM') {
      return network.name;
    }
    return `${network?.name ?? ''}: ${network?.endpoint?.toString().replace(/\/$/, '') ?? ''}`;
  }

  function formatAccount(account: Account): string {
    return account.address;
  }
</script>

<div id="provider-login" class="content-block flex w-single-block flex-col gap-4">
  <BlockSection title="Provider Login">
    <DropDownMenu
      id="network"
      label="Select a Network"
      bind:selected={$user.network}
      placeholder="Select a network"
      options={$allNetworks}
      onChange={networkChanged}
      formatter={formatNetwork}
    />
    {#if $user.network != null && $user.network.name == 'CUSTOM'}
      <input
        id="other-endpoint-url"
        type="text"
        pattern="^(http:\/\/|https:\/\/|ws:\/\/|wss:\/\/).+"
        placeholder="wss://some.frequency.node"
        bind:value={customNetwork}
        disabled={$user.network.name != 'CUSTOM'}
        class:hidden={$user.network.name != 'CUSTOM'}
        on:keydown={customNetworkChanged}
      />
    {/if}
    <div id="network-error-msg" class="text-sm text-error">{networkErrorMsg}</div>
    <DropDownMenu
      id="controlkeys"
      label="Select a Provider Control Key"
      bind:selected={selectedAccount}
      placeholder="Select a provider"
      options={Array.from($providerAccountsStore.values())}
      onChange={accountChanged}
      formatter={formatAccount}
      disabled={Array.from($providerAccountsStore.keys()).length == 0}
    />
    <div id="controlkey-error-msg" class="text-sm text-error">{controlKeysErrorMsg}</div>
    <Button id="connect-button" title="Connect" disabled={!canConnect} action={connect} />
  </BlockSection>

  <BlockSection title="Not a Provider?">
    <div class="text-sm">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
      aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
    <Button id="request-2b-provider-btn" title="Become a Provider" action={becomeProvider} />
  </BlockSection>

  <div class="mt-24 text-xs">
    To transact on Frequency as a provider you will need frequency utility tokens. On Frequency testnet, you can get
    tokens from the Testnet Faucet. To do that: Get XRQCY tokens for Frequency Testnet (Rococo) and follow the
    instructions using your desired wallet address to get XRQCY tokens. Once that succeeds, verify the tokens have made
    it to your wallet by selecting or re-selecting the address above. You may need to wait a minute. For more
    information, you can also visit the Rococo Accounts page via the Polkadot UI.
  </div>
</div>
