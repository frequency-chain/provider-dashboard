<script lang="ts">
  import Switch from '$lib/assets/Switch.svelte';
  import type { Account, Accounts } from '$lib/stores/accountsStore';
  import { allNetworks, type NetworkInfo } from '$lib/stores/networksStore';
  import { isValidURL, selectNetworkOptions } from '$lib/utils';
  import { IconButton, Input, Select } from '@frequency-chain/style-guide';
  import { onMount } from 'svelte';

  interface Props {
    networkValue: NetworkInfo['name'] | undefined;
    accounts: Accounts;
    newUser: Account | null;
    resetState: () => void;
    connectAndFetchAccounts: (network: NetworkInfo | null) => Promise<void>;
    selectedNetwork: NetworkInfo | null;
    isCustomNetwork: boolean;
    connectedToEndpoint: boolean;
    networkErrorMsg: string;
    isLoading: boolean;
  }

  let {
    networkValue = $bindable(),
    accounts = $bindable(),
    newUser = $bindable(null),
    resetState,
    connectAndFetchAccounts,
    selectedNetwork = $bindable(null),
    isCustomNetwork = $bindable(false),
    connectedToEndpoint = $bindable(false),
    networkErrorMsg = $bindable(),
    isLoading = $bindable(false),
  }: Props = $props();

  // if there is a selected network from the store, use it
  onMount(async () => {
    if (selectedNetwork) {
      await networkChanged();
    }
  });

  let customNetwork: string = $state('');

  const networkOptions = selectNetworkOptions($allNetworks);

  async function networkChanged() {
    isLoading = true;
    accounts = new Map();

    await connectAndFetchAccounts(selectedNetwork!);
    
    newUser = {
      network: selectedNetwork!,
      address: '',
      isProvider: false,
      balances: { transferable: 0n, locked: 0n, total: 0n },
    };
    isLoading = false;
  }

  $effect(() => {
    if (!isCustomNetwork && selectedNetwork?.endpoint && isValidURL(selectedNetwork.endpoint.toString())) {
      networkChanged();
    }
  });

  function customNetworkChanged(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (isValidURL(customNetwork) && selectedNetwork) {
        selectedNetwork.endpoint = customNetwork;
      }
    }
  }
</script>

{#if !connectedToEndpoint}
  <Select
    bind:value={networkValue}
    id="network"
    label="Select a Network"
    placeholder="Select a Network"
    options={networkOptions}
    {isLoading}
    error={networkErrorMsg}
  />
{:else}
  <p class="gap-f8 flex items-center">
    <IconButton data-testid="switch-button" label="switch button" onclick={resetState} disabled={isLoading}
      ><Switch /></IconButton
    >
    <span class="text-primary smText font-bold">Connected to {selectedNetwork?.name || 'Custom'}</span>
  </p>
{/if}
{#if isCustomNetwork}
  <Input
    id="custom-endpoint-url"
    type="text"
    pattern="^(http:\/\/|https:\/\/|ws:\/\/|wss:\/\/).+"
    placeholder="wss://some.frequency.node"
    bind:value={customNetwork}
    onkeydown={customNetworkChanged}
    disabled={false}
    error={undefined}
    label="Custom Endpoint URL"
  />
{/if}
