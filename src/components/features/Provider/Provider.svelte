<script lang="ts">
  import { dotApi, storeChainInfo } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import { balanceToHuman } from '$lib/utils';
  import { getControlKeys } from '$lib/polkadotApi';
  import ListCard from '../../atoms/ListCard.svelte';
  import AddControlKey from './AddControlKey.svelte';
  import { Button, Modal } from '@frequency-chain/style-guide';
  import type { ApiPromise } from '@polkadot/api';
  import AddToClipboard from '$atoms/AddToClipboard.svelte';

  let isAddControlKeyOpen: boolean = $state(false);
  let controlKeys: string[] = $state([]);

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
      value: balanceToHuman($user.balances.total, $storeChainInfo.token),
    },
    { label: 'Transferable', value: balanceToHuman($user.balances.transferable, $storeChainInfo.token) },
    { label: 'Locked', value: balanceToHuman($user.balances.locked, $storeChainInfo.token) },
  ]);
  let errMsg: string = '';

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
