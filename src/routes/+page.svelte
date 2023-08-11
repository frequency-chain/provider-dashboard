<script lang="ts">
  import {
    storeBlockNumber,
    storeConnected,
    storeToken,
    storeValidAccounts,
    transactionSigningAddress,
  } from '$lib/stores';
  import Connect from '$components/Connect.svelte';
  import Capacity from '$components/Capacity.svelte';
  import Intro from '$components/Intro.svelte';
  import Provider from '$components/Provider.svelte';
  import KeySelection from '$components/KeySelection.svelte';
  import ProviderActions from '$components/ProviderActions.svelte';

  let token = '';
  let blockNumber = 0n;
  let connected = false;
  let validAccounts = {};
  let showDashboard = false;

  storeBlockNumber.subscribe((val) => (blockNumber = val));
  storeToken.subscribe((val) => (token = val));
  storeConnected.subscribe((val) => (connected = val));
  storeValidAccounts.subscribe((val) => (validAccounts = val));

  const onChangeTxnSigningAddress = (evt: Event) => {
    let option = evt.target as HTMLOptionElement;
    transactionSigningAddress.update((addr) => (addr = option.value));
  };
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/mvp.css@1.12/mvp.css" />
</svelte:head>
<h1 class="text-3xl font-bold pb-8 grow">
  Welcome to Provider Dashboard</h1>
<Intro bind:dismissed={showDashboard}/>
<div id="status-bar" class="flex pr-8 justify-start pt-6">
  <div id="connection-status" class="status-item pr-6">
    <h3 class="text-aqua font-bold">Connection status: {connected ? 'Connected' : 'Not connected'}</h3>
    <p class:hidden={!connected}>Token: <span id="unit">{token}</span></p>
    <p class:hidden={!connected}>Current block number: <span id="current-block">{blockNumber}</span></p>
  </div>
  <div id="provider-status" class="pr-6">
    <Provider />
  </div>
  <div id="capacity-status" class="pr-6">
    <Capacity bind:token />
  </div>
</div>
<div id="main-actions" class:hidden={!showDashboard}>
  <form id="setupForm">
    <Connect />
    <div class={connected ? '' : 'hidden'}>
      <KeySelection
        component="TransactionSigningKey"
        selectLabel="2. Choose a Transaction Signing Address"
        selectedOption={''}
        onSelect={onChangeTxnSigningAddress}
        {validAccounts}
      />
    </div>
  </form>
  <ProviderActions />
</div>
