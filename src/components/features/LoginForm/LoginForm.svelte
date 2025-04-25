<script lang="ts">
  import { providerAccountsStore, type Account } from '$lib/stores/accountsStore';
  import { clearLog } from '$lib/stores/activityLogStore';
  import { user } from '$lib/stores/userStore';
  import { Button } from '@frequency-chain/style-guide';
  import SelectNetworkAndAccount from '../SelectNetworkAndAccount/SelectNetworkAndAccount.svelte';

  // Props
  interface Props {
    onConnect?: () => void;
    onCancel?: (() => void) | undefined;
  }

  let { onConnect = () => {}, onCancel = undefined }: Props = $props();

  // Get the matching account object safely
  let newUser: Account | null = $state($providerAccountsStore.get($user.address) ?? null);

  // Derive whether we can connect
  const canConnect = $derived.by(() => {
    console.log('Selected new user: ', newUser);
    return newUser?.network != null && $providerAccountsStore.size > 0 && newUser?.address !== '';
  });

  // Handle connect
  async function connect() {
    if (!newUser) {
      alert('Invalid form values');
      return;
    }
    if ($user.network) clearLog();
    $user = newUser;
    onConnect();
  }
</script>

<form class="column gap-f16">
  <SelectNetworkAndAccount
    bind:newUser
    accounts={$providerAccountsStore}
    accountSelectorTitle="Select a Provider Account Id"
    accountSelectorPlaceholder="Select a Provider Account Id"
    noAccountsFoundErrorMsg="No Provider Account Ids found. To become a Provider, see below."
  />

  <div class="flex items-end justify-between">
    <Button type="primary" disabled={!canConnect} onclick={connect}>Connect to Account</Button>

    {#if onCancel}
      <button type="button" class="btn-no-fill hover:text-teal text-sm underline" onclick={onCancel}>Cancel</button>
    {/if}
  </div>
</form>
