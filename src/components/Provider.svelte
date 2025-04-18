<script lang="ts">
  import { run } from 'svelte/legacy';

  import { dotApi, storeChainInfo } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import { balanceToHuman } from '$lib/utils';
  import { getBalances } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';
  import ListCard from './ListCard.svelte';
  import AddAccountId from './AddAccountId.svelte';
  import { Button } from '@frequency-chain/style-guide';

  let accountBalances: AccountBalances = $state({ transferable: 0n, locked: 0n, total: 0n });
  let isAddAccountIdOpen: boolean = $state(false);

  run(() => {
    // Easy way to tag a subscription onto this action.
    // This way we update the information when the log updates
    const _triggerReloadOnLogUpdate = $activityLog;
    if ($dotApi.api) {
      getBalances($dotApi.api, $user.address).then((info) => (accountBalances = info));
    }
  });

  let providerList: { label: string; value: string }[] = $state([]);
  let errMsg: string = '';

  run(() => {
    providerList = [
      { label: 'Id', value: $user.msaId?.toString() ?? '' },
      { label: 'Name', value: $user.providerName ?? '' },
      {
        label: 'Total Balance',
        value: balanceToHuman(accountBalances.total, $storeChainInfo.token),
      },
      { label: 'Transferable', value: balanceToHuman(accountBalances.transferable, $storeChainInfo.token) },
      { label: 'Locked', value: balanceToHuman(accountBalances.locked, $storeChainInfo.token) },
    ];
  });
</script>

<ListCard title="Provider" list={providerList} errorMessage={errMsg}>
  <Button size="sm" class="btn-primary" onclick={() => (isAddAccountIdOpen = true)}>Add Account Id</Button>
  <AddAccountId isOpen={isAddAccountIdOpen} close={() => (isAddAccountIdOpen = false)} />
</ListCard>
