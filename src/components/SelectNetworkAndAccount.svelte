<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import { allNetworks, NetworkType, type NetworkInfo, networkNameToNetworkInfo } from '$lib/stores/networksStore';

  import { Account, fetchAccountsForNetwork, type Accounts } from '$lib/stores/accountsStore';
  import type { ApiPromise } from '@polkadot/api';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
  import DropDownMenu from '$components/DropDownMenu.svelte';
  import { formatNetwork, formatAccount, isValidURL } from '$lib/utils';
  import { createApi } from '$lib/polkadotApi';
  import { page } from '$app/stores';

  interface Props {
    newUser: Account | undefined;
    accounts: Accounts;
    accountSelectorTitle?: string;
    accountSelectorPlaceholder?: string;
    noAccountsFoundErrorMsg?: string;
  }

  let {
    newUser = $bindable(),
    accounts = $bindable(),
    accountSelectorTitle = 'Select an account',
    accountSelectorPlaceholder = 'Select an account',
    noAccountsFoundErrorMsg = 'No accounts found.',
  }: Props = $props();

  // Wallet access
  let thisWeb3Enable: typeof web3Enable;
  let thisWeb3Accounts: typeof web3Accounts;

  let selectedAccount: Account | null = $state(null);
  let selectedNetwork: NetworkInfo | null = $state(networkNameToNetworkInfo($page.params.network) ?? null);
  let customNetwork: string = $state('');
  let isCustomNetwork: boolean = $state(false);
  let isLoading: boolean = $state(false);
  let connectedToEndpoint: boolean = $state(false);

  // Error messages
  let networkErrorMsg: string = $state('');
  let controlKeysErrorMsg: string = $state('');

  // We need to access the user's wallet to get the accounts
  onMount(async () => {
    // This must be in onMount because the extension requires that you have a window to attach to.
    // Since this project is precompiled, there will be no window until onMount
    const polkadotExt = await import('@polkadot/extension-dapp');
    thisWeb3Enable = polkadotExt.web3Enable;
    thisWeb3Accounts = polkadotExt.web3Accounts;
    if (selectedNetwork) {
      await networkChanged();
    }
  });

  async function connectAndFetchAccounts(network: NetworkInfo | null): Promise<void> {
    if (network) {
      try {
        networkErrorMsg = '';
        controlKeysErrorMsg = '';
        if (!network.endpoint) throw new Error('Undefined endpoint.');
        const curApi = await createApi(network.endpoint);
        await fetchAccountsForNetwork(network, thisWeb3Enable, thisWeb3Accounts, curApi.api as ApiPromise);
        await curApi.api?.disconnect();
      } catch (e) {
        console.log(e);
        networkErrorMsg = `Could not connect to ${
          network.endpoint || 'empty value'
        }. Please enter a valid and reachable Websocket URL.`;
        console.error(networkErrorMsg);
      }
      if (networkErrorMsg == '' && accounts.size === 0) {
        controlKeysErrorMsg = noAccountsFoundErrorMsg;
      }
    }
  }

  function accountChanged() {
    if (selectedAccount) newUser = selectedAccount;
  }

  async function networkChanged() {
    isLoading = true;
    isCustomNetwork = selectedNetwork?.id === NetworkType.CUSTOM;
    accounts = new Map();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (selectedNetwork?.endpoint && isValidURL(selectedNetwork!.endpoint.toString())) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await connectAndFetchAccounts(selectedNetwork!);
      connectedToEndpoint = true;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newUser = { network: selectedNetwork!, address: '', isProvider: false };
    isLoading = false;
  }

  const onSelectNetworkChanged = () => {
    if (!selectedNetwork) return;
    isCustomNetwork = selectedNetwork.id === NetworkType.CUSTOM;
    if (!isCustomNetwork) {
      if (selectedNetwork.endpoint && isValidURL(selectedNetwork.endpoint.toString())) {
        const baseUrl =
          $page.url.pathname === '/become-a-provider' ? $page.url.toString() : $page.url.origin.toString();
        goto([baseUrl, selectedNetwork.pathName].join('/'));
        networkChanged();
      }
    }
  };

  function customNetworkChanged(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (isValidURL(customNetwork)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        selectedNetwork!.endpoint = customNetwork;
      }
    }
  }

  const resetState = () => {
    selectedNetwork = null;
    selectedAccount = null;
    isCustomNetwork = false;
    connectedToEndpoint = false;
    networkErrorMsg = '';
    controlKeysErrorMsg = '';
    newUser = undefined;
  };
</script>

{#if !connectedToEndpoint}
  <DropDownMenu
    id="network"
    label="Select a Network"
    bind:value={selectedNetwork}
    placeholder="Select a Network"
    options={$allNetworks}
    onChange={onSelectNetworkChanged}
    formatter={formatNetwork}
    {isLoading}
  />
{:else}
  <p class="my-f24 flex justify-between">
    <span class="text-teal">Connected to {selectedNetwork?.name || 'Custom'}</span>
    <button onclick={resetState} class="hover:text-teal cursor-pointer text-sm underline">Change networks</button>
  </p>
{/if}
{#if isCustomNetwork}
  <input
    id="other-endpoint-url"
    type="text"
    pattern="^(http:\/\/|https:\/\/|ws:\/\/|wss:\/\/).+"
    placeholder="wss://some.frequency.node"
    bind:value={customNetwork}
    disabled={false}
    class:hidden={false}
    onkeydown={customNetworkChanged}
  />
{/if}
{#if networkErrorMsg}
  <div id="network-error-msg" class="text-error text-sm">{networkErrorMsg}</div>
{/if}
<DropDownMenu
  id="controlkeys"
  label={accountSelectorTitle}
  bind:value={selectedAccount}
  placeholder={accountSelectorPlaceholder}
  options={Array.from(accounts.values())}
  onChange={accountChanged}
  formatter={formatAccount}
  disabled={accounts.size === 0 || isLoading}
/>
{#if controlKeysErrorMsg}
  <div id="controlkey-error-msg" class="text-error text-sm">{controlKeysErrorMsg}</div>
{/if}
