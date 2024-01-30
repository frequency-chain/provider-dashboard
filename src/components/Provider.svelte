<script lang="ts">
  import { dotApi, storeConnected, storeToken, storeCurrentAction } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { balanceToHuman } from '$lib/utils';
  import type { ApiPromise } from '@polkadot/api';
  import { getBalances } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';
  import ListCard from './ListCard.svelte';
  import { ActionForms } from '$lib/storeTypes.js';

  let accountBalances: AccountBalances = { free: 0n, reserved: 0n, frozen: 0n };

  let connected = false;
  storeConnected.subscribe((val) => (connected = val));

  let token = '';
  storeToken.subscribe((val) => (token = val.toString()));

  let api: ApiPromise;
  dotApi.subscribe(async (storeDotApi) => {
    if (storeConnected && storeDotApi.api) {
      api = storeDotApi.api;
    }
  });

  user.subscribe(async (val) => {
    if (api) {
      accountBalances = await getBalances(api, $user.address);
    }
  });

  function showAddControlKey() {
    storeCurrentAction.set(ActionForms.AddControlKey);
  }

  let providerList: { label: string; value: string }[] = [];
  let emptyMessage: string = '';

  $: {
    if (!connected) {
      emptyMessage = 'Not connected';
    } else if (!$user.signingKey) {
      emptyMessage = 'No transaction signing address selected';
    } else if (!$user.msaId) {
      emptyMessage = 'No MSA ID.  Please create one.';
    } else {
      providerList = [
        { label: 'Id', value: $user.msaId?.toString() },
        { label: 'Name', value: $user.providerName ?? '' },
        { label: 'Total Balance', value: balanceToHuman(accountBalances.free + accountBalances.frozen, token) },
        { label: 'Transferable', value: balanceToHuman(accountBalances.free, token) },
        { label: 'Locked', value: balanceToHuman(accountBalances.frozen, token) },
      ];
    }
  }
</script>

<ListCard title="Provider" list={providerList} {emptyMessage}>
  <button on:click|preventDefault={showAddControlKey} class="btn-primary">Add control key</button>
</ListCard>
