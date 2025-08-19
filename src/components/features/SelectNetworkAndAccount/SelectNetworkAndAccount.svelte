<script lang="ts">
  import { onMount } from 'svelte';

  import { type NetworkInfo } from '$lib/stores/networksStore';

  import { Account, fetchAccountsForNetwork, type Accounts } from '$lib/stores/accountsStore';
  import type { ApiPromise } from '@polkadot/api';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
  import { createApi } from '$lib/polkadotApi';
  import SelectNetwork from './SelectNetwork.svelte';
  import SelectAccount from './SelectAccount.svelte';

  interface Props {
    newUser: Account | null;
    accounts: Accounts;
    accountSelectorTitle?: string;
    accountSelectorPlaceholder?: string;
    noAccountsFoundErrorMsg?: string;
    isLoading?: boolean;
    canCopyAddress?: boolean;
  }

  let {
    newUser = $bindable(),
    accounts = $bindable(),
    accountSelectorTitle = 'Select an account',
    accountSelectorPlaceholder = 'Select an account',
    noAccountsFoundErrorMsg = 'No accounts found.',
    isLoading = $bindable(false),
    canCopyAddress = false,
  }: Props = $props();

  // Wallet access
  let thisWeb3Enable: typeof web3Enable;
  let thisWeb3Accounts: typeof web3Accounts;

  let selectedAccount: Account | null = $state(newUser);
  let selectedNetwork: NetworkInfo | null = $state(newUser?.network ?? null);
  let isCustomNetwork: boolean = $state(false);
  let connectedToEndpoint: boolean = $state(false);
  let networkErrorMsg: string = $state('');
  let accountErrorMsg: string = $state('');

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
        accountErrorMsg = '';
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
        accountErrorMsg = noAccountsFoundErrorMsg;
      }
    }
  }

  const resetState = () => {
    selectedNetwork = null;
    selectedAccount = null;
    isCustomNetwork = false;
    connectedToEndpoint = false;
    networkErrorMsg = '';
    accountErrorMsg = '';
    newUser = null;
  };
</script>

<SelectNetwork
  bind:accounts
  bind:newUser
  {resetState}
  {connectAndFetchAccounts}
  bind:selectedNetwork
  bind:isCustomNetwork
  bind:connectedToEndpoint
  bind:networkErrorMsg
  bind:isLoading
/>
<SelectAccount
  {accounts}
  bind:newUser
  bind:selectedAccount
  {accountSelectorTitle}
  {accountSelectorPlaceholder}
  bind:accountErrorMsg
  {isLoading}
  {canCopyAddress}
/>
