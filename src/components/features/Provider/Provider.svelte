<script lang="ts">
  import { run } from 'svelte/legacy';

  import { dotApi, storeChainInfo } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import { balanceToHuman } from '$lib/utils';
  import { getBalances } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';
  import ListCard from '../../atoms/ListCard.svelte';
  import AddControlKey from './AddControlKey.svelte';
  import ViewControlKeys from './ViewControlKeys.svelte';

  let accountBalances: AccountBalances = $state({ transferable: 0n, locked: 0n, total: 0n });

  run(() => {
    // Easy way to tag a subscription onto this action.
    // This way we update the information when the log updates
    const _triggerReloadOnLogUpdate = $activityLog;
    if ($dotApi.api) {
      getBalances($dotApi.api, $user.address).then((info) => (accountBalances = info));
    }
  });

  let errMsg: string = '';

  const providerList: { label: string; value: string }[] = $derived([
    { label: 'Id', value: $user.msaId?.toString() ?? '' },
    { label: 'Name', value: $user.providerName ?? '' },
    {
      label: 'Total Balance',
      value: balanceToHuman(accountBalances.total, $storeChainInfo.token),
    },
    { label: 'Transferable', value: balanceToHuman(accountBalances.transferable, $storeChainInfo.token) },
    { label: 'Locked', value: balanceToHuman(accountBalances.locked, $storeChainInfo.token) },
  ]);
</script>

<ListCard title="Provider" list={providerList} errorMessage={errMsg}>
  <AddControlKey />
  <ViewControlKeys />
</ListCard>
