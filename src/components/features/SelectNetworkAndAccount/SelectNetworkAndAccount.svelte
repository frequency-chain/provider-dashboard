<script lang="ts">
  import { onMount, tick } from 'svelte';

  import { allNetworks, NetworkType, type NetworkInfo } from '$lib/stores/networksStore';

  import { Account, type Accounts } from '$lib/stores/accountsStore';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
  import SelectNetwork from './SelectNetwork.svelte';
  import SelectAccount from './SelectAccount.svelte';
  import { connectAndFetchAccounts, isValidURL } from '$lib/utils';
  import { user } from '$lib/stores/userStore';

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

  let accountValue: Account['address'] | undefined = $state();
  let selectedAccount: Account | null = $derived(accounts.get(accountValue ?? '') ?? null);

  let networkValue: NetworkInfo['name'] | undefined = $state(newUser?.network?.name ?? $user.network?.name);
  let selectedNetwork: NetworkInfo | null = $derived($allNetworks.find((n) => n.name === networkValue) ?? null);
  let isCustomNetwork: boolean = $derived(selectedNetwork?.id === NetworkType.CUSTOM);

  let connectedToEndpoint: boolean = $derived(!!selectedNetwork?.endpoint && accounts.size > 0);

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

  async function networkChanged() {
    if (!thisWeb3Enable || !thisWeb3Accounts) {
      console.warn('web3 functions not ready yet');
      return;
    }

    isLoading = true;
    networkErrorMsg = '';
    accountErrorMsg = '';

    try {
      await connectAndFetchAccounts(selectedNetwork!, thisWeb3Enable, thisWeb3Accounts);
      if (networkErrorMsg == '' && accounts.size === 0) {
        accountErrorMsg = noAccountsFoundErrorMsg;
      }
    } catch (error) {
      networkErrorMsg = (error as Error).message;
    }

    newUser = {
      network: selectedNetwork!,
      address: '',
      isProvider: false,
      balances: { transferable: 0n, locked: 0n, total: 0n },
    };
    isLoading = false;
  }

  $effect(() => {
    if (
      !isCustomNetwork &&
      selectedNetwork?.endpoint &&
      selectedNetwork !== $user.network &&
      isValidURL(selectedNetwork.endpoint.toString())
    ) {
      networkChanged();
    }
  });

  $effect(() => {
    if (selectedAccount !== null && newUser?.address !== selectedAccount?.address) {
      newUser = selectedAccount;
    }
  });

  const resetState = () => {
    networkValue = undefined;
    accountValue = undefined;
    networkErrorMsg = '';
    accountErrorMsg = '';
  };
</script>

<SelectNetwork
  bind:networkValue
  {resetState}
  bind:selectedNetwork
  {isCustomNetwork}
  {connectedToEndpoint}
  {isLoading}
  {networkErrorMsg}
/>
<SelectAccount
  {accounts}
  bind:accountValue
  {accountSelectorTitle}
  {accountSelectorPlaceholder}
  {accountErrorMsg}
  {isLoading}
  {canCopyAddress}
/>
