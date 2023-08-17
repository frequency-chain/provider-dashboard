<script lang="ts">
  import {
    storeBlockNumber,
    storeConnected,
    storeMsaInfo,
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
  import ConnectionStatus from '$components/ConnectionStatus.svelte';
  import logo from '$lib/assets/logo.png';
  import topright from '$lib/assets/top-right-bars.png';
  import bottomleft from '$lib/assets/bottom-left-bars.png';

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
    storeMsaInfo.set({ isProvider: false, msaId: 0, providerName: '' });
    transactionSigningAddress.set(option.value);
  };
</script>
<img alt="decoration-top-right" src={topright} class="float-right z-0"/>
<img alt="The project logo" src={logo} />
<h1 class="text-3xl font-bold">Welcome to Provider Dashboard</h1>
<div id="status-bar" class="flex p-8 justify-start h-52 bg-white-transparent">
  <div class="pr-8">Overview:</div>
  <ConnectionStatus {blockNumber} {connected} {token} />
  <Provider />
  <Capacity bind:token />
</div>
<div id="main-actions" class:hidden={!showDashboard} class="mt-8 text-white">
  <form id="setupForm">
    <Connect />
    <div class={connected ? '' : 'hidden'}>
      <KeySelection
        component="TransactionSigningKey"
        selectLabel="Choose a Transaction Signing Address"
        selectedOption={''}
        onSelect={onChangeTxnSigningAddress}
        {validAccounts}
      />
    </div>
  </form>
  <ProviderActions {validAccounts} />
</div>
<Intro bind:dismissed={showDashboard} />
<img alt="decoration-bottom-left" src={bottomleft} class="mt-20 sticky bottom left-8 -z-40"/>
