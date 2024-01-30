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

  let api: ApiPromise;
  dotApi.subscribe(async (storeDotApi) => {
    if ($storeConnected && storeDotApi.api) {
      api = storeDotApi.api;
      accountBalances = await getBalances(api, $user.address);
    }
  });

  function showAddControlKey() {
    storeCurrentAction.set(ActionForms.AddControlKey);
  }

  let providerList: { label: string; value: string }[] = [];
  let errMsg: string = '';

  $: {
    if (!$storeConnected) {
      errMsg = 'Not connected';
    } else if (!$user.signingKey) {
      errMsg = 'No transaction signing address selected';
    } else if (!$user.msaId) {
      errMsg = 'No MSA ID.  Please create one.';
    } else {
      errMsg = '';
      providerList = [
        { label: 'Id', value: $user.msaId?.toString() },
        { label: 'Name', value: $user.providerName ?? '' },
        { label: 'Total Balance', value: balanceToHuman(accountBalances.free + accountBalances.frozen, $storeToken) },
        { label: 'Transferable', value: balanceToHuman(accountBalances.free, $storeToken) },
        { label: 'Locked', value: balanceToHuman(accountBalances.frozen, $storeToken) },
      ];
    }
  }
</script>

<ListCard title="Provider" list={providerList} errorMessage={errMsg}>
  <button on:click|preventDefault={showAddControlKey} class="btn-primary">Add control key</button>
</ListCard>
