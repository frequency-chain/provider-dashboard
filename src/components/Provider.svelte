<script lang="ts">
  import { dotApi, storeChainInfo } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import { balanceToHuman } from '$lib/utils';
  import { getBalances } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';
  import ListCard from './ListCard.svelte';
  import AddControlKey from './AddControlKey.svelte';

  let accountBalances: AccountBalances = { free: 0n, reserved: 0n, frozen: 0n };
  let isAddKeyOpen: boolean = false;

  $: {
    // Easy way to tag a subscription onto this action.
    // This way we update the information when the log updates
    const _triggerReloadOnLogUpdate = $activityLog;
    if ($dotApi.api) {
      getBalances($dotApi.api, $user.address).then((info) => (accountBalances = info));
    }
  }

  let providerList: { label: string; value: string }[] = [];
  let errMsg: string = '';

  $: {
    providerList = [
      { label: 'Id', value: $user.msaId?.toString() ?? '' },
      { label: 'Name', value: $user.providerName ?? '' },
      {
        label: 'Total Balance',
        value: balanceToHuman(accountBalances.free + accountBalances.frozen, $storeChainInfo.token),
      },
      { label: 'Transferable', value: balanceToHuman(accountBalances.free, $storeChainInfo.token) },
      { label: 'Locked', value: balanceToHuman(accountBalances.frozen, $storeChainInfo.token) },
    ];
  }
</script>

<ListCard title="Provider" list={providerList} errorMessage={errMsg}>
  <button on:click|preventDefault={() => (isAddKeyOpen = true)} class="btn-primary">Add control key</button>
  <AddControlKey isOpen={isAddKeyOpen} close={() => (isAddKeyOpen = false)} />
</ListCard>
