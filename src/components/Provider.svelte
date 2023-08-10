<script lang="ts">
  import { dotApi, storeProviderId, storeConnected, storeToken, transactionSigningAddress } from '$lib/stores';
  import { ActionForms } from '$lib/storeTypes';
  import type { AccountInfo } from '$lib/storeTypes';
  import { storeCurrentAction } from '$lib/stores.js';
  import type { ApiPromise } from '@polkadot/api';
  import { formatBalance } from '@polkadot/util';
  import { getBalances } from '$lib/polkadotApi';

  // the locally stored value of the provider Id
  let localProvider = 0;
  storeProviderId.subscribe((val) => (localProvider = val));
  let connected = false;
  storeConnected.subscribe((val) => (connected = val));

  let token = '';
  storeToken.subscribe((val) => (token = val));

  let api: ApiPromise;
  dotApi.subscribe((storeDotApi) => {
    if (storeConnected && storeDotApi.api) {
      api = storeDotApi.api;
    }
  });

  let accountInfo: AccountInfo = { balanceFree: 0n, balanceReserved: 0n, balanceFrozen: 0n, balanceTotal: 0n };
  let localSigningAddress = ''; // eslint-disable-line no-unused-vars
  transactionSigningAddress.subscribe(async (val) => {
    localSigningAddress = val;
    if (api) {
      accountInfo = await getBalances(api, val);
    }
  });

  const balanceToHuman = (balance: bigint): string => {
    return formatBalance(balance, { withSiFull: true, withUnit: token, withZero: true });
  };

  function showAddControlKey() {
    storeCurrentAction.update((val) => (val = ActionForms.AddControlKey));
  }

  function showStake() {
    storeCurrentAction.update((val) => (val = ActionForms.Stake));
  }
</script>

<div class={connected ? '' : 'hidden'}>
  <h3>Provider</h3>
  {#if !localProvider}
    <p>Selected Key is not associated with a Provider</p>
  {:else}
    <p>Id: {localProvider}</p>
    <p>Total Balance: {balanceToHuman(accountInfo.free + accountInfo.frozen)}</p>
    <p>Transferable: {balanceToHuman(accountInfo.free)}</p>
    <p>Locked: {balanceToHuman(accountInfo.frozen)}</p>
    <button on:click={showAddControlKey}>Add control key</button>
    <button on:click={showStake}>Stake To Provider</button>
  {/if}
</div>
