<script lang="ts">
  import Switch from '$lib/assets/Switch.svelte';
  import { allNetworks, type NetworkInfo } from '$lib/stores/networksStore';
  import { isValidURL, selectNetworkOptions } from '$lib/utils';
  import { IconButton, Input, Select } from '@frequency-chain/style-guide';

  interface Props {
    networkValue: NetworkInfo['name'] | undefined;
    resetState: () => void;
    selectedNetwork: NetworkInfo | null;
    isCustomNetwork: boolean;
    connectedToEndpoint: boolean;
    networkErrorMsg: string;
    isLoading: boolean;
  }

  let {
    networkValue = $bindable(),
    resetState,
    selectedNetwork = $bindable(null),
    isCustomNetwork = false,
    connectedToEndpoint = false,
    networkErrorMsg = '',
    isLoading = false,
  }: Props = $props();

  let customNetwork: string = $state('');

  const networkOptions = selectNetworkOptions($allNetworks);

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
    disabled={isLoading}
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
