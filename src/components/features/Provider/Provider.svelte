<script lang="ts">
  import { run } from 'svelte/legacy';

  import { dotApi, storeChainInfo } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import { balanceToHuman } from '$lib/utils';
  import { getBalances, getControlKeys } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';
  import ListCard from '../../atoms/ListCard.svelte';
  import AddControlKey from './AddControlKey.svelte';
  import { Button, Modal } from '@frequency-chain/style-guide';
  import type { ApiPromise } from '@polkadot/api';
  import AddToClipboard from '$atoms/AddToClipboard.svelte';

  let accountBalances: AccountBalances = $state({ transferable: 0n, locked: 0n, total: 0n });
  let isAddControlKeyOpen: boolean = $state(false);
  let controlKeys: string[] = $state([]);

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

  function handleGetControlKeys() {
    if (!$user.msaId) return;
    getControlKeys($dotApi.api as ApiPromise, $user.msaId).then((keys) => {
      if (keys) controlKeys = keys;
    });
  }
</script>

<ListCard title="Provider" list={providerList} errorMessage={errMsg}>
  <Button size="sm" onclick={() => (isAddControlKeyOpen = true)}>Add Control Key</Button>
  <AddControlKey isOpen={isAddControlKeyOpen} close={() => (isAddControlKeyOpen = false)} />

  <Modal title="Control Keys" description={`Keys associated with the logged in provider (MSA ID: ${$user.msaId})`}>
    {#snippet trigger()}
      <Button size="sm" onclick={handleGetControlKeys}>View Control Keys</Button>
    {/snippet}
    {#snippet body()}
      {#each controlKeys as key (key)}
        <div class="gap-f4 items-top pt-f20 flex border-t">
          <div class="font-bold wrap-anywhere">{key}</div>
          <AddToClipboard />
        </div>
      {/each}
    {/snippet}
  </Modal>
</ListCard>
