<script lang="ts">
  import { providerAccountsStore, type Account } from '$lib/stores/accountsStore';
  import { clearLog } from '$lib/stores/activityLogStore';
  import { user } from '$lib/stores/userStore';
  import Button from './Button.svelte';
  import SelectNetworkAndAccount from './SelectNetworkAndAccount.svelte';

  export let onConnect: () => void = () => {};
  export let onCancel: (() => void) | undefined = undefined;

  let newUser: Account | undefined = $providerAccountsStore.get($user.address);

  $: canConnect = newUser?.network != null && $providerAccountsStore.size > 0 && newUser?.address !== '';

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
  noAccountsFoundErrorMsg="No Provider Account Ids found.  Become a Provider?"
/>
<div class="flex justify-between align-bottom">
  <Button id="connect-button" title="Connect" disabled={!canConnect} action={connect} />
  {#if onCancel}
    <button class="btn-no-fill" on:click|preventDefault={onCancel}>Cancel</button>
  {/if}
</div>
