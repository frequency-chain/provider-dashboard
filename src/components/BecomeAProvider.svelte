<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { nonProviderAccountsStore, type Account } from '$lib/stores/accountsStore';
  import BlockSection from './BlockSection.svelte';
  import SelectNetworkAndAccount from './SelectNetworkAndAccount.svelte';
  import CreateMsa from './CreateMsa.svelte';
  import CreateProvider from './CreateProvider.svelte';
  import EmailProviderRequest from './EmailProviderRequest.svelte';
  import { pageContent } from '$lib/stores/pageContentStore';
  import { dotApi } from '$lib/stores';
  import { createAndConnectToApi } from '$lib/polkadotApi';

  let newUser: Account | undefined;

  // a callback for when the user cancels this action
  export let cancelAction = () => {
    pageContent.login();
  };

  async function updateApiAndUser() {
    if (!newUser) {
      alert('Invalid form values');
      return;
    }

    const endpoint = newUser.network?.endpoint?.origin;
    if (!endpoint) {
      alert('Error connecting to endpoint.');
      return;
    }

    if ($dotApi.api?.isConnected) $dotApi.api?.disconnect();
    await createAndConnectToApi(endpoint);
    $user = newUser;
  }
</script>

<div id="become-a-provider" class="content-block column w-single-block">
  <BlockSection title="Become a Provider">
    <form class="column w-[320px]">
      <SelectNetworkAndAccount
        bind:newUser
        accounts={$nonProviderAccountsStore}
        accountSelectorTitle="Wallet Address"
        accountSelectorPlaceholder="Select a wallet address"
        noAccountsFoundErrorMsg="No accounts found.  Add an account to your wallet."
      />
      {#if newUser?.network != null && newUser.network.name === 'MAINNET'}
        <EmailProviderRequest />
      {:else if newUser && newUser?.address !== ''}
        {#if newUser?.msaId === 0}
          <CreateMsa beforeCreate={updateApiAndUser} />
        {:else}
          <CreateProvider beforeCreate={updateApiAndUser} />
        {/if}
      {:else}
        <button on:click|preventDefault={cancelAction} class="btn-no-fill text-left">Cancel</button>
      {/if}
    </form>
  </BlockSection>
  <BlockSection title="More Info">
    <div class="text-sm">
      For developer and testing convenience, on Testnet, anyone with an MSA who wishes to become a Provider may simply
      submit a createProvider transaction.<br /><br />This action will register the MSA Id that is controlled by the
      selected Transaction Signing Address above. Any control key for the MSA Id can submit the transaction.
    </div>
  </BlockSection>
</div>
