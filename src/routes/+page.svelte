<script lang="ts">
  import {
    storeBlockNumber, storeChainInfo,
    storeConnected,
    storeMsaInfo,
    storeToken,
    storeValidAccounts,
    transactionSigningAddress,
  } from '$lib/stores';
  import Connect from '$components/Connect.svelte';
  import Capacity from '$components/Capacity.svelte';
  import Provider from '$components/Provider.svelte';
  import KeySelection from '$components/KeySelection.svelte';
  import ProviderActions from '$components/ProviderActions.svelte';
  import ChainStatus from '$components/ChainStatus.svelte';
  import Banner from '$components/Banner.svelte';
  import logo from '$lib/assets/logo.png';
  import topright from '$lib/assets/top-right-bars.png';
  import bottomleft from '$lib/assets/bottom-left-bars.png';
  import type {ChainInfo, MsaInfo} from "$lib/storeTypes";

  let token = '';
  let blockNumber = 0n;
  let epochNumber = 0n;
  let connected = false;
  let validAccounts = {};

  // TODO: put all this in chainInfo and update how it's stored.
  storeBlockNumber.subscribe((val) => (blockNumber = val));
  storeToken.subscribe((val) => (token = val));
  storeConnected.subscribe((val) => (connected = val));
  storeValidAccounts.subscribe((val) => (validAccounts = val));
  storeChainInfo.subscribe((info: ChainInfo) => (epochNumber = info.epochNumber));

  const onChangeTxnSigningAddress = (evt: Event) => {
    let option = evt.target as HTMLOptionElement;
    storeMsaInfo.set({isProvider: false, msaId: 0, providerName: ''});
    transactionSigningAddress.set(option.value);
  };
</script>
<img alt="decoration-top-left" src={topright} class="mt-0 absolute top right-8 -z-40"/>

<Banner />
<ChainStatus {blockNumber} {connected} {token} {epochNumber}/>
<div class="flex justify-center">
  <Provider/>
  <Capacity bind:token/>
</div>
<div class="mt-8 text-white">
  <form id="setupForm">
    <Connect/>
    <div class:hidden={!connected} class="mt-8">
      <KeySelection
        component="TransactionSigningKey"
        selectLabel="Choose a Wallet Address"
        selectedOption={''}
        onSelect={onChangeTxnSigningAddress}
        {validAccounts}
      />
    </div>
  </form>
  <ProviderActions {validAccounts}/>
</div>
<Banner />
<img alt="decoration-bottom-left" src={bottomleft} class="mt-20 fixed bottom-0 left-8 -z-40"/>
