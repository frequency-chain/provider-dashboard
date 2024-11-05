<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { providerAccountsStore, type Account } from '$lib/stores/accountsStore';
  import { clearLog } from '$lib/stores/activityLogStore';
  import { user } from '$lib/stores/userStore';
  import Button from './Button.svelte';
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
  accountSelectorTitle="Select an Account Id"
  accountSelectorPlaceholder="Select a Provider Account Id"
  noAccountsFoundErrorMsg="No Provider Account Ids found. To become a Provider, see below."
/>
<div class="flex justify-between align-bottom">
  <Button id="connect-button" title="Connect" disabled={!canConnect} action={connect} />
  {#if onCancel}
    <button class="btn-no-fill" onclick={preventDefault(onCancel)}>Cancel</button>
  {/if}
</div>
