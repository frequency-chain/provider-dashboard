<script lang="ts">
  import {
    dotApi,
    storeConnected,
    storeMsaInfo,
    storeToken,
    transactionSigningAddress,
    storeCurrentAction,
  } from '$lib/stores';
  import type { MsaInfo } from '$lib/storeTypes';
  import { balanceToHuman } from '$lib/utils';
  import type { ApiPromise } from '@polkadot/api';
  import { getBalances } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';
  import ListCard from './ListCard.svelte';
  import { ActionForms } from '$lib/storeTypes.js';

  let msaInfo: MsaInfo;
  let accountBalances: AccountBalances = { free: 0n, reserved: 0n, frozen: 0n };

  let connected = false;
  storeConnected.subscribe((val) => (connected = val));

  let token = '';
  storeToken.subscribe((val) => (token = val.toString()));

  let api: ApiPromise;
  dotApi.subscribe((storeDotApi) => {
    if (storeConnected && storeDotApi.api) {
      api = storeDotApi.api;
    }
  });

  let signingAddress = ''; // eslint-disable-line no-unused-vars
  transactionSigningAddress.subscribe(async (val) => {
    signingAddress = val;
    if (api) {
      accountBalances = await getBalances(api, val);
    }
  });

  storeMsaInfo.subscribe((info) => {
    msaInfo = info as MsaInfo;
  });

  function showAddControlKey() {
    storeCurrentAction.set(ActionForms.AddControlKey);
  }

  $: providerList = [
    { label: 'Id', value: msaInfo?.msaId.toString() },
    { label: 'Name', value: msaInfo?.providerName },
    { label: 'Total Balance', value: balanceToHuman(accountBalances.free + accountBalances.frozen, token) },
    { label: 'Transferable', value: balanceToHuman(accountBalances.free, token) },
    { label: 'Locked', value: balanceToHuman(accountBalances.frozen, token) },
  ];
</script>

<ListCard title="Provider" list={providerList} {signingAddress} {msaInfo} {connected}>
  <button on:click|preventDefault={showAddControlKey} class="btn-primary">Add control key</button>
</ListCard>
