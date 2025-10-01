<script lang="ts">
  import { providerAccountsStore, type Account } from '$lib/stores/accountsStore';
  import { clearLog } from '$lib/stores/activityLogStore';
  import { user } from '$lib/stores/userStore';
  import { Button } from '@frequency-chain/style-guide';
  import SelectNetworkAndAccount from '../SelectNetworkAndAccount/SelectNetworkAndAccount.svelte';
  import ButtonNoFill from '$atoms/ButtonNoFill.svelte';

  interface Props {
    modalOpen?: boolean | null;
  }

  let { modalOpen = $bindable(null) }: Props = $props();

  let newUser: Account | null = $state($providerAccountsStore.get($user?.address) ?? null);

  const canConnect = $derived.by(() => {
    return newUser?.network != null && $providerAccountsStore.size > 0 && newUser?.address !== '';
  });

  async function connect() {
    if (!newUser) {
      alert('Invalid form values');
      return;
    }
    if ($user?.network) clearLog();
    $user = newUser;
    if (modalOpen !== null) modalOpen = false;
  }
</script>

<form class="column gap-f16">
  <SelectNetworkAndAccount
    bind:newUser
    accounts={$providerAccountsStore}
    accountSelectorTitle="Select a Provider Control Key"
    accountSelectorPlaceholder="Select a Provider Control Key"
    noAccountsFoundErrorMsg="No Provider Control Keys found. To become a Provider, see below."
  />

  <div class="flex items-end justify-between">
    <Button disabled={!canConnect} onclick={connect}>Connect to Account</Button>

    {#if modalOpen !== null}
      <ButtonNoFill onclick={() => (modalOpen = false)}>Cancel</ButtonNoFill>
    {/if}
  </div>
</form>
