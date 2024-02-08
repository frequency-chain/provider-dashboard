<script lang="ts">
  import { onMount } from 'svelte';
  import { allNetworks, type NetworkInfo } from '$lib/stores/networksStore';
  import { createApi } from '$lib/polkadotApi';
  import { Account, fetchAccountsForNetwork } from '$lib/stores/accountsStore';
  import { user } from '$lib/stores/userStore';
  import type { ApiPromise } from '@polkadot/api';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
  import DropDownMenu from '$components/DropDownMenu.svelte';
  import { formatNetwork, formatAccount, isValidURL } from '$lib/utils';

  export let newUser: Account | undefined;
  export let accounts: Map<string, Account>;
  export let accountSelectorTitle: string = 'Select an account';
  export let accountSelectorPlaceholder: string = 'Select an account';
  export let noAccountsFoundErrorMsg: string = 'No accounts found.';

  // Wallet access
  let thisWeb3Enable: typeof web3Enable;
  let thisWeb3Accounts: typeof web3Accounts;

  let selectedAccount: Account | undefined = newUser;
  let selectedNetwork: NetworkInfo | undefined = newUser?.network;
  let customNetwork: string;
  let isCustomNetwork: boolean;
  let isLoading: boolean = false;

  // Error messages
  let networkErrorMsg: string = '';
  let controlKeysErrorMsg: string = '';

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
        if (!network.endpoint) throw new Error('Undefined endpoint.');
        const curApi = await createApi(network.endpoint?.origin);
        await fetchAccountsForNetwork(network, thisWeb3Enable, thisWeb3Accounts, curApi.api as ApiPromise);
        await curApi.api?.disconnect();
      } catch (e) {
        console.log(e);
        networkErrorMsg = `Could not connect to ${
          network.endpoint?.origin || 'empty value'
        }. Please enter a valid and reachable Websocket URL.`;
        console.error(networkErrorMsg);
      }
      for (const account of accounts) {
        // console.log(`Found provider: ${account}`);
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
    accounts = new Map();
    if (selectedNetwork?.endpoint && isValidURL(selectedNetwork!.endpoint.toString())) {
      await connectAndFetchAccounts(selectedNetwork!);
    }
    isCustomNetwork = selectedNetwork?.name === 'CUSTOM';
    newUser = { network: selectedNetwork!, address: '', isProvider: false };
    isLoading = false;
  }

  function customNetworkChanged(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (isValidURL(customNetwork)) {
        const url = new URL(customNetwork);
        selectedNetwork!.endpoint = url;
      }
    }
  }
</script>

<div class="column">
  <DropDownMenu
    id="network"
    label="Select a Network"
    bind:value={selectedNetwork}
    placeholder="Select a network"
    options={$allNetworks}
    onChange={networkChanged}
    formatter={formatNetwork}
  />
  {#if isCustomNetwork}
    <input
      id="other-endpoint-url"
      type="text"
      pattern="^(http:\/\/|https:\/\/|ws:\/\/|wss:\/\/).+"
      placeholder="wss://some.frequency.node"
      bind:value={customNetwork}
      disabled={!isCustomNetwork}
      class:hidden={!isCustomNetwork}
      on:keydown={customNetworkChanged}
    />
  {/if}
  <div id="network-error-msg" class="text-error text-sm">{networkErrorMsg}</div>
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
  <div id="controlkey-error-msg" class="text-error text-sm">{controlKeysErrorMsg}</div>
</div>
