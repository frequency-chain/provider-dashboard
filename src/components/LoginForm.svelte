<script lang="ts">
  import { providerAccountsStore, type Account } from '$lib/stores/accountsStore';
  import { user } from '$lib/stores/userStore';
  import Button from './Button.svelte';
  import SelectNetworkAndAccount from './SelectNetworkAndAccount.svelte';
  import { createAndConnectToApi } from '$lib/polkadotApi';

  export let onConnect: () => void = () => {};
  export let onCancel: (() => void) | undefined = undefined;

  let newUser: Account | undefined = $user;

  $: canConnect = newUser?.network != null && $providerAccountsStore.size > 0 && newUser?.address !== '';

  async function connect() {
    if (!newUser) {
      alert('Invalid form values');
      return;
    }

    const endpoint = newUser.network?.endpoint?.toString();
    if (!endpoint) {
      alert('Error connecting to endpoint.');
      return;
    }

    await createAndConnectToApi(endpoint);
    $user = newUser;
    onConnect();
  }
</script>

<SelectNetworkAndAccount
  bind:newUser
  accounts={$providerAccountsStore}
  accountSelectorTitle="Select a Provider Control Key"
  accountSelectorPlaceholder="Select a provider control key"
  noAccountsFoundErrorMsg="No provider accounts found.  Become a provider?"
/>
<div class="flex justify-between align-bottom">
  <Button id="connect-button" title="Connect" disabled={!canConnect} action={connect} />
  {#if onCancel}
    <button class="btn-no-fill" on:click|preventDefault={onCancel}>Cancel</button>
  {/if}
</div>
