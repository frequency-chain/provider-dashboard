<script lang="ts">
  import Switch from '$lib/assets/Switch.svelte';
  import type { Account, Accounts } from '$lib/stores/accountsStore';
  import { allNetworks, NetworkType, type NetworkInfo } from '$lib/stores/networksStore';
  import { isValidURL, selectNetworkOptions } from '$lib/utils';
  import { IconButton, Select } from '@frequency-chain/style-guide';
  import type { Selected } from 'bits-ui';
  import { onMount } from 'svelte';

  interface Props {
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
    accounts = $bindable(),
    newUser = $bindable(null),
    resetState,
    connectAndFetchAccounts,
    selectedNetwork = $bindable(null),
    isCustomNetwork = $bindable(false),
    connectedToEndpoint = $bindable(false),
    networkErrorMsg,
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

  const onSelectNetworkChanged = (selectedNetworkOption: Selected<string>) => {
    const { value } = selectedNetworkOption;
    const curNetwork: NetworkInfo | undefined = $allNetworks.find((network) => network.name === value);
    if (curNetwork) {
      selectedNetwork = curNetwork;
    }

    if (!selectedNetwork) return;
    isCustomNetwork = selectedNetwork.id === NetworkType.CUSTOM;
    if (!isCustomNetwork) {
      networkChanged();
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
</script>

{#if !connectedToEndpoint}
  <Select
    id="network"
    label="Select a Network"
    placeholder="Select a Network"
    options={networkOptions}
    onSelectedChange={onSelectNetworkChanged}
    {isLoading}
    error={networkErrorMsg}
  />
{:else}
  <p class="my-f24 gap-f8 flex items-center">
    <IconButton label="switch button" onclick={resetState}><Switch /></IconButton>
    <span class="text-primary smText font-bold">Connected to {selectedNetwork?.name || 'Custom'}</span>
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
  <div id="network-error-msg" class="text-error smText">{networkErrorMsg}</div>
{/if}
