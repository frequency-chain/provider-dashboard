<script lang="ts">
  import {
    dotApi,
    storeProviderId,
    storeConnected,
    storeToken,
    transactionSigningAddress
  } from '$lib/stores';
  import {ActionForms} from '$lib/storeTypes';
  import type { AccountInfo} from "$lib/storeTypes";
  import { storeCurrentAction } from '$lib/stores.js';
  import type {ApiPromise} from "@polkadot/api";
  import { formatBalance } from "@polkadot/util";

  // the locally stored value of the provider Id
  let localProvider = 0;
  storeProviderId.subscribe((val) => (localProvider = val));
  let connected = false;
  storeConnected.subscribe((val) => (connected = val));

  let token = '';
  storeToken.subscribe(val => token = val);

  let api: ApiPromise;
  dotApi.subscribe(storeDotApi => {
    if (storeConnected && storeDotApi.api) {
      api = storeDotApi.api
    }
  })

  let accountInfo = { balanceFree: 0n, balanceReserved: 0n, balanceFrozen: 0n, balanceTotal: 0n};
  let localSigningAddress = '';
  transactionSigningAddress.subscribe(async val => {
    localSigningAddress = val;
    if (api) {
      let accountData = (await api.query.system.account(val)).data;
      accountInfo.balanceFree = accountData.free.toBigInt();
      accountInfo.balanceFrozen = accountData.frozen.toBigInt();
      accountInfo.balanceReserved = accountData.reserved.toBigInt();
      accountInfo.balanceTotal = accountInfo.balanceFree + accountInfo.balanceFrozen;
    }
  });

  const balanceToHuman = (balance: bigint): string => {
    return formatBalance(balance, {withSi: true, withUnit: token, withZero: true})
  }

  function showAddControlKey() {
    storeCurrentAction.update((val) => (val = ActionForms.AddControlKey));
  }
</script>

<div class={connected ? '' : 'hidden'}>
  <h3>Provider</h3>
  {#if !localProvider}
    <p>Selected Key is not associated with a Provider</p>
  {:else}
    <p>Id: {localProvider}</p>
    <p>Total Balance: {balanceToHuman(accountInfo.balanceTotal)}</p>
    <p>Free Balance: {balanceToHuman(accountInfo.balanceFree)}</p>
    <button on:click={showAddControlKey}>Add control key</button>
  {/if}
</div>
