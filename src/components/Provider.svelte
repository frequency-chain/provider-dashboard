<script lang="ts">
  import {
    dotApi,
    storeConnected,
    storeCurrentAction,
    storeMsaInfo,
    storeToken,
    transactionSigningAddress
  } from '$lib/stores';
  import type {MsaInfo} from '$lib/storeTypes';
  import {ActionForms} from "$lib/storeTypes";
  import type {ApiPromise} from "@polkadot/api";
  import {formatBalance} from "@polkadot/util";
  import {getBalances} from "$lib/polkadotApi";
  import type { AccountBalances } from "$lib/polkadotApi";
  import { isMainnet } from "$lib/utils";

  let connected = false;
  storeConnected.subscribe((val) => (connected = val));

  let token = '';
  storeToken.subscribe((val) => (token = val.toString()));

  let api: ApiPromise;
  let network:string  = '';
  dotApi.subscribe((storeDotApi) => {
    network = storeDotApi?.selectedEndpoint || '';
    if (storeConnected && storeDotApi.api) {
      api = storeDotApi.api;
    }
  });

  let accountInfo: AccountInfo = { balanceFree: 0n, balanceReserved: 0n, balanceFrozen: 0n, balanceTotal: 0n };
  let localSigningAddress = ''; // eslint-disable-line no-unused-vars
  transactionSigningAddress.subscribe(async (val) => {
    localSigningAddress = val;
    if (api) {
      accountBalances = await getBalances(api, val);
    }
  });

  // the locally stored value of the provider Id
  let msaId = 0;
  let isProvider = false;

  storeMsaInfo.subscribe((info: MsaInfo) => {
    msaId = info?.msaId || 0;
    isProvider = info?.isProvider || false
  });

  let accountBalances: AccountBalances = { free: 0n, reserved: 0n, frozen: 0n};

  const balanceToHuman = (balance: bigint): string => {
    return formatBalance(balance, { withSiFull: true, withUnit: token, withZero: true });
  };

  function showAddControlKey() {
    storeCurrentAction.update((val) => (val = ActionForms.AddControlKey));
  }

  function showStake() {
    storeCurrentAction.update((val) => (val = ActionForms.Stake));
  }
  // Show RequestToBeProvider if we are Mainnet, show CreateProvider otherwise.
  function showCreateOrRequestProvider(_evt: Event) {
    const currentAction: ActionForms = isMainnet(network) ? ActionForms.RequestToBeProvider : ActionForms.CreateProvider;
    storeCurrentAction.set(currentAction);
  }
</script>

<div class={connected ? '' : 'hidden'}>
  <h3>Provider</h3>
  {#if isProvider}
    <p>Id: {msaId}</p>
    <button on:click|preventDefault={showAddControlKey}>Add control key</button>
  {:else if (msaId === 0)}
    <p>No Msa Id. Please create an MSA first.</p>
  {:else}
    {#if localSigningAddress === ''}
      <p>No transaction signing address selected</p>
    {:else}
      <p>Selected Key is not associated with a Provider</p>
      <button on:click|preventDefault={showCreateOrRequestProvider} class:hidden={localSigningAddress===''}>Become a Provider</button>
    {/if}
  {:else}
    <p>Id: {localProviderID}</p>
    <button on:click={showAddControlKey}>Add control key</button>
    <button on:click={showStake}>Stake To Provider</button>
  {/if}
  <p>Total Balance: {balanceToHuman(accountBalaces.free + accountBalaces.frozen)}</p>
  <p>Transferable: {balanceToHuman(accountBalaces.free)}</p>
  <p>Locked: {balanceToHuman(accountBalaces.frozen)}</p>
</div>
