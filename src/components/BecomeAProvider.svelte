<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { nonProviderAccountsStore } from '$lib/stores/accountsStore';
  import BlockSection from './BlockSection.svelte';
  import SelectNetworkAndAccount from './SelectNetworkAndAccount.svelte';
  import CreateMsa from './CreateMsa.svelte';
  import CreateProvider from './CreateProvider.svelte';
  import { NetworkType } from '$lib/stores/networksStore';
  import BackHomeButton from '$components/BackHomeButton.svelte';
  import RequestToBeProvider from '$components/RequestToBeProvider.svelte';

  let hasRequestedToBeProvider = $state(false);
</script>

<div id="become-a-provider" class="content-block column w-single-block">
  <BlockSection title="Become a Provider">
    <form class="column w-[320px]">
      {#if hasRequestedToBeProvider === false}
        <SelectNetworkAndAccount
          bind:newUser={$user}
          accounts={$nonProviderAccountsStore}
          accountSelectorTitle="Select an Account Id"
          accountSelectorPlaceholder="Select an Account Id"
          noAccountsFoundErrorMsg="No accounts found.  Add an Account Id to your wallet."
        />
      {/if}
      {#if $user && $user?.address !== ''}
        {#if $user?.msaId === 0}
          <CreateMsa />
        {:else if $user?.network?.id === NetworkType.MAINNET}
          <RequestToBeProvider bind:hasRequestedToBeProvider />
        {:else}
          <CreateProvider />
        {/if}
      {:else}
        <BackHomeButton cancelText="Back" />
      {/if}
    </form>
  </BlockSection>
  <BlockSection title="More Info">
    <div class="text-sm">
      For developer and testing convenience, on Testnet, anyone with an MSA who wishes to become a Provider may simply
      submit a createProvider transaction.<br /><br />This action will register the MSA Id that is controlled by the
      selected Transaction Signing Address above. Any Account Id that has been added to the MSA can submit the
      transaction.
    </div>
  </BlockSection>
</div>
