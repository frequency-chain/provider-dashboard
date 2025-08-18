<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { nonProviderAccountsStore } from '$lib/stores/accountsStore';
  import BlockSection from '$atoms/BlockSection.svelte';
  import SelectNetworkAndAccount from '$features/SelectNetworkAndAccount/SelectNetworkAndAccount.svelte';
  import BecomeProviderNextSteps from '$features/BecomeProviderNextSteps/BecomeProviderNextSteps.svelte';

  let hasRequestedToBeProvider = $state(false);
  let isLoading = $state(false);
</script>

<BlockSection id="become-a-provider" title="Become a Provider">
  <form class="column gap-f16">
    {#if hasRequestedToBeProvider === false}
      <SelectNetworkAndAccount
        bind:newUser={$user}
        bind:isLoading
        accounts={$nonProviderAccountsStore}
        accountSelectorTitle="Select an Control Key"
        accountSelectorPlaceholder="Select an Control Key"
        noAccountsFoundErrorMsg="No accounts found.  Add an Control Key to your wallet."
      />
    {/if}
    <BecomeProviderNextSteps bind:hasRequestedToBeProvider bind:isLoading />
  </form>
</BlockSection>

<BlockSection title="More Info">
  <div class="smText">
    For developer and testing convenience, on Testnet, anyone with an MSA who wishes to become a Provider may simply
    submit a createProvider transaction.<br /><br />This action will register the MSA Id that is controlled by the
    selected Transaction Signing Address above. Any Control Key that has been added to the MSA can submit the
    transaction.
  </div>
</BlockSection>
