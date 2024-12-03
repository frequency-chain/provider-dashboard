<script lang="ts">
  import { providerAccountsStore, type Account } from '$lib/stores/accountsStore';
  import { clearLog } from '$lib/stores/activityLogStore';
  import { user } from '$lib/stores/userStore';
  import { Button } from '@frequency-chain/style-guide';

  import SelectNetworkAndAccount from './SelectNetworkAndAccount.svelte';

  interface Props {
    onConnect?: () => void;
    onCancel?: (() => void) | undefined;
  }

  let { onConnect = () => {}, onCancel = undefined }: Props = $props();

  let newUser: Account | undefined = $state($providerAccountsStore.get($user.address));

  let canConnect = $derived(newUser?.network != null && $providerAccountsStore.size > 0 && newUser?.address !== '');

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

<SelectNetworkAndAccount
  bind:newUser
  accounts={$providerAccountsStore}
  accountSelectorTitle="Select a Provider Account Id"
  accountSelectorPlaceholder="Select a Provider Account Id"
  noAccountsFoundErrorMsg="No Provider Account Ids found. To become a Provider, see below."
/>
<div class="mt-f24 flex justify-between align-bottom">
  <Button
    class="hover-teal px-f12 py-f8 disabled:bg-gray3"
    type="primary"
    size="md"
    disabled={!canConnect}
    onClick={connect}
  >
    Connect to Account
  </Button>
  {#if onCancel}
    <button class="px-f12 py-f8 underline hover:text-teal" onclick={onCancel}>Cancel</button>
  {/if}
</div>
