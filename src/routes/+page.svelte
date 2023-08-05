<script lang="ts">
  import {
    storeBlockNumber,
    storeConnected,
    storeCurrentAction, storeMsaInfo,
    storeToken,
    storeValidAccounts,
    transactionSigningAddress,
  } from '$lib/stores';
  import Connect from '$components/Connect.svelte';
  import Capacity from '$components/Capacity.svelte';
  import Intro from '$components/Intro.svelte';
  import Provider from '$components/Provider.svelte';
  import KeySelection from '$components/KeySelection.svelte';
  import Stake from '$components/Stake.svelte';
  import type {ActionForms} from "$lib/storeTypes";
  import {ActionForms, defaultMsaInfo} from "$lib/storeTypes";
  import type {SvelteComponent} from "svelte";
  import RequestToBeProvider from "../components/RequestToBeProvider.svelte";
  import AddControlKey from "../components/AddControlKey.svelte";
  import CreateProvider from "../components/CreateProvider.svelte";

  let token = '';
  let blockNumber = 0n;
  let connected = false;
  let validAccounts = {};
  let showDashboard = false;
  let currentAction = ActionForms.NoForm;

  storeBlockNumber.subscribe((val) => (blockNumber = val));
  storeToken.subscribe((val) => (token = val));
  storeConnected.subscribe((val) => (connected = val));
  storeValidAccounts.subscribe((val) => (validAccounts = val));
  storeCurrentAction.subscribe((val) => (currentAction =val));

  const onChangeTxnSigningAddress = (evt: Event) => {
    storeMsaInfo.set(defaultMsaInfo);
    let option = evt.target as HTMLOptionElement;
    transactionSigningAddress.update((addr) => (addr = option.value));
  };

  const showForm = (): SvelteComponent|undefined =>  {
    switch (currentAction) {
      case ActionForms.RequestToBeProvider:
        return RequestToBeProvider;
      case ActionForms.AddControlKey:
        return AddControlKey;
      case ActionForms.CreateProvider:
        return CreateProvider
      default:
        return undefined
    }
  }
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
  <CreateProvider isProvider={providerId > 0} msaId={providerId}/>
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
