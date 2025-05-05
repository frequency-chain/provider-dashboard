<script lang="ts">
  import { Account, unusedKeyAccountsStore } from '$lib/stores/accountsStore.js';
  import { formatAccount, getExtension } from '$lib/utils.js';
  import DropDownMenu from '$atoms/DropDownMenu.svelte';
  import { Button } from '@frequency-chain/style-guide';
  import { user } from '$lib/stores/userStore.js';
  import { submitAddAccountId } from '$lib/connections.js';
  import { dotApi } from '$lib/stores.js';
  import { ApiPromise } from '@polkadot/api';
  import { preventDefault } from 'svelte/legacy';
  import ButtonNoFill from '$atoms/ButtonNoFill.svelte';

  interface Props {
    onCancel: () => void;
    selectedAccount?: Account | null;
  }

  let { onCancel, selectedAccount = $bindable() }: Props = $props();

  let isSubmitDisabled = $derived(selectedAccount?.injectedAccount == null);

  const addAccountId = async () => {
    if (!selectedAccount || !selectedAccount.injectedAccount) {
      alert('Please choose an Account Id to add.');
    } else if (!$user.msaId || !$user.injectedAccount) {
      alert('Invalid provider.');
    } else {
      onCancel();
      await submitAddAccountId(
        $dotApi.api as ApiPromise,
        await getExtension($user),
        selectedAccount,
        $user,
        $user.msaId
      );
    }
  };
</script>

<form class="column gap-f16">
  <DropDownMenu
    id="AddAccountId"
    label="Account Id to Add"
    placeholder="Select Id..."
    bind:value={selectedAccount}
    options={Array.from($unusedKeyAccountsStore.values()) || []}
    disabled={$unusedKeyAccountsStore.size === 0}
    formatter={formatAccount}
  />
  {#if $unusedKeyAccountsStore.size === 0}
    <div id="network-error-msg" class="text-error text-sm">
      No available Account Ids. Create a new Account Id without an MSA Id.
    </div>
  {/if}

  <div class="flex items-end justify-between">
    <Button onclick={addAccountId} disabled={isSubmitDisabled}>Add Account Id</Button>
    <ButtonNoFill onclick={onCancel}>Cancel</ButtonNoFill>
  </div>
</form>
