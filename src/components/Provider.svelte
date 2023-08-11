<script lang="ts">
  import {
    dotApi,
    storeConnected,
    storeCurrentAction,
    storeMsaInfo,
    storeToken,
    transactionSigningAddress,
  } from '$lib/stores';
  import type { MsaInfo } from '$lib/storeTypes';
  import { ActionForms } from '$lib/storeTypes';
  import type { ApiPromise } from '@polkadot/api';
  import {formatBalance } from '@polkadot/util';
  import { getBalances } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';
  import { isMainnet } from '$lib/utils';

  let msaInfo: MsaInfo;
  let accountBalances: AccountBalances = { free: 0n, reserved: 0n, frozen: 0n };

  let connected = false;
  storeConnected.subscribe((val) => (connected = val));

  let token = '';
  storeToken.subscribe((val) => (token = val.toString()));

  let api: ApiPromise;
  let network: string = '';
  dotApi.subscribe((storeDotApi) => {
    network = storeDotApi?.selectedEndpoint || '';
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

  const balanceToHuman = (balance: bigint): string => {
    return formatBalance(balance, { withSiFull: true, withUnit: token, withZero: true, decimals: 10 });
  };

  function showAddControlKey() {
    storeCurrentAction.set(ActionForms.AddControlKey);
  }

  function showStake() {
    storeCurrentAction.update((val) => (val = ActionForms.Stake));
  }
  // Show RequestToBeProvider if we are Mainnet, show CreateProvider otherwise.
  function showCreateOrRequestProvider(_evt: Event) {
    const currentAction: ActionForms = isMainnet(network)
      ? ActionForms.RequestToBeProvider
      : ActionForms.CreateProvider;
    storeCurrentAction.set(currentAction);
  }
</script>

<div class="pl-6 ml-6 border-l-8 border-aqua">
  <h3 class="text-aqua font-bold">Provider</h3>
  {#if !connected}
    <p>Not connected</p>
  {:else}
    {#if localSigningAddress === ''}
      <p>No transaction signing address selected</p>
    {:else }
      {#if msaInfo?.msaId === 0}
        <p>No Msa Id. Please create an MSA first.</p>
      {:else}
        <p>Id: {msaInfo.msaId}</p>
      {/if}
      {#if msaInfo?.isProvider}
        <p>Name: {msaInfo.providerName}</p>
        <button on:click|preventDefault={showAddControlKey}>Add control key</button>
        <button on:click={showStake}>Stake To Provider</button>
      {:else if msaInfo.msaId > 0}
        <p>Selected Key is not associated with a Provider</p>
        <button on:click|preventDefault={showCreateOrRequestProvider} class:hidden={localSigningAddress === ''}>
          Become a Provider</button>
      {/if}
    {/if}
  {/if}
  {#if localSigningAddress !== ''}
    <p>Total Balance: {balanceToHuman(accountBalances.free + accountBalances.frozen)}</p>
    <p>Transferable: {balanceToHuman(accountBalances.free)}</p>
    <p>Locked: {balanceToHuman(accountBalances.frozen)}</p>
  {/if}
</div>