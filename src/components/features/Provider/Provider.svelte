<script lang="ts">
  import { storeChainInfo } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import { balanceToHuman } from '$lib/utils';
  import ListCard from '../../atoms/ListCard.svelte';
  import AddControlKey from './AddControlKey.svelte';
  import ViewControlKeys from './ViewControlKeys.svelte';

  $effect(() => {
    // Easy way to tag a subscription onto this action.
    // This way we update the information when the log updates
    const _triggerReloadOnLogUpdate = $activityLog;
  });

  const providerList: { label: string; value: string }[] = $derived([
    { label: 'Id', value: $user.msaId?.toString() ?? '' },
    { label: 'Name', value: $user.providerName ?? '' },
    {
      label: 'Total Balance',
      value: balanceToHuman($user.balances?.total, $storeChainInfo.token),
    },
    { label: 'Transferable', value: balanceToHuman($user.balances?.transferable, $storeChainInfo.token) },
    { label: 'Locked', value: balanceToHuman($user.balances?.locked, $storeChainInfo.token) },
  ]);
  let errMsg: string = '';
</script>

<ListCard title="Provider" list={providerList} errorMessage={errMsg}>
  <AddControlKey />
  <ViewControlKeys />
</ListCard>
