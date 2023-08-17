<script lang="ts">
  import { dotApi, storeConnected, storeMsaInfo, storeToken, transactionSigningAddress } from '$lib/stores';
  import type { MsaInfo } from '$lib/storeTypes';
  import { balanceToHuman } from '$lib/utils';
  import type { ApiPromise } from '@polkadot/api';
  import { getBalances } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';

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

  let localSigningAddress = ''; // eslint-disable-line no-unused-vars
  transactionSigningAddress.subscribe(async (val) => {
    localSigningAddress = val;
    if (api) {
      accountBalances = await getBalances(api, val);
    }
  });

  storeMsaInfo.subscribe((info: MsaInfo) => {
    msaInfo = info;
  });
</script>

<div class="pl-6 ml-6">
  <h3 class="text-aqua font-bold">Provider</h3>
  {#if !connected}
    <p>Not connected</p>
  {:else if localSigningAddress === ''}
    <p>No transaction signing address selected</p>
  {:else}
    {#if msaInfo?.msaId === 0}
      <p>No Msa Id. Please create an MSA first.</p>
    {:else}
      <p>Id: {msaInfo.msaId}</p>
    {/if}
    {#if msaInfo?.isProvider}
      <p>Name: {msaInfo.providerName}</p>
    {:else if msaInfo.msaId > 0}
      <p>Selected Key is not associated with a Provider</p>
    {/if}
  {/if}
  {#if localSigningAddress !== ''}
    <p>Total Balance: {balanceToHuman(accountBalances.free + accountBalances.frozen, token)}</p>
    <p>Transferable: {balanceToHuman(accountBalances.free, token)}</p>
    <p>Locked: {balanceToHuman(accountBalances.frozen, token)}</p>
  {/if}
</div>
