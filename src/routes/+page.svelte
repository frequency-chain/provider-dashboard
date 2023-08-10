<script lang="ts">
  import {
    storeBlockNumber,
    storeConnected,
    storeValidAccounts,
    transactionSigningAddress,
    storeProviderId,
    storeToken,
  } from '$lib/stores';
  import Connect from '$components/Connect.svelte';
  import Capacity from '$components/Capacity.svelte';
  import Intro from '$components/Intro.svelte';
  import Provider from '$components/Provider.svelte';
  import AddControlKey from '$components/AddControlKey.svelte';
  import KeySelection from '$components/KeySelection.svelte';
  import Stake from '$components/Stake.svelte';

  let token = '';
  let blockNumber = 0;
  let connected = false;
  let validAccounts = {};
  let providerId = 0;
  let showDashboard = false;

  storeBlockNumber.subscribe((val) => (blockNumber = val));
  storeToken.subscribe((val) => (token = val));
  storeConnected.subscribe((val) => (connected = val));
  storeValidAccounts.subscribe((val) => (validAccounts = val));
  storeProviderId.subscribe((id) => (providerId = id));

  const onChangeTxnSigningAddress = (evt: Event) => {
    let option = evt.target as HTMLOptionElement;
    transactionSigningAddress.update((addr) => (addr = option.value));
  };
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/mvp.css@1.12/mvp.css" />
</svelte:head>

<h1>Welcome to Provider Dashboard</h1>
<Intro bind:dismissed={showDashboard} />
<div id="status-bar">
  <div id="connection-status" class="status-item">
    <h3>Connection status: {connected ? 'Connected' : 'Not connected'}</h3>
    <p>Token: <span id="unit">{token}</span></p>
    <p>Current block number: <span id="current-block">{blockNumber}</span></p>
  </div>
  <div id="provider-status" class="status-item">
    <Provider />
  </div>
  <div id="capacity-status" class="status-item">
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
  <AddControlKey {providerId} {validAccounts} />
  <Stake {providerId} {validAccounts} />
</div>

<style>
  #status-bar {
    display: flex;
    font-size: smaller;
  }
  .status-item {
    padding-right: 1.5em;
  }
</style>
