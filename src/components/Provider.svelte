<script lang="ts">
  import { dotApi, storeChainInfo, storeCurrentAction } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { balanceToHuman } from '$lib/utils';
  import { getBalances } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';
  import ListCard from './ListCard.svelte';
  import { ActionForms } from '$lib/storeTypes.js';
  import { onMount } from 'svelte';

  let accountBalances: AccountBalances = { free: 0n, reserved: 0n, frozen: 0n };

  onMount(async () => {
    console.log($dotApi.selectedEndpoint);
    if ($dotApi.api) {
      accountBalances = await getBalances($dotApi.api, $user.address);
    }
  });

  function showAddControlKey() {
    storeCurrentAction.set(ActionForms.AddControlKey);
  }

  let providerList: { label: string; value: string }[] = [];
  let errMsg: string = '';

  $: {
    if (!$storeChainInfo.connected) {
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
        {
          label: 'Total Balance',
          value: balanceToHuman(accountBalances.free + accountBalances.frozen, $storeChainInfo.token),
        },
        { label: 'Transferable', value: balanceToHuman(accountBalances.free, $storeChainInfo.token) },
        { label: 'Locked', value: balanceToHuman(accountBalances.frozen, $storeChainInfo.token) },
      ];
    }
  }
</script>

<ListCard title="Provider" list={providerList} errorMessage={errMsg}>
  <button on:click|preventDefault={showAddControlKey} class="btn-primary">Add control key</button>
</ListCard>
