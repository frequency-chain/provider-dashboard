<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { submitAddAccountId } from '$lib/connections';
  import { getExtension } from '$lib/utils';
  import AddKeyRequirements from './AddKeyRequirements.svelte';
  import Modal from './Modal.svelte';
  import DropDownMenu from './DropDownMenu.svelte';
  import { user } from '$lib/stores/userStore';
  import { type Account, unusedKeyAccountsStore } from '$lib/stores/accountsStore';
  import { formatAccount } from '$lib/utils';

  interface Props {
    isOpen: boolean;
    close: () => void;
  }

  let { isOpen, close }: Props = $props();

  let selectedAccount: Account | null = $state();

  let isSubmitDisabled = $derived(selectedAccount?.injectedAccount == null);

  const addAccountId = async () => {
    if (!selectedAccount || !selectedAccount.injectedAccount) {
      alert('Please choose an Account Id to add.');
    } else if (!$user.msaId || !$user.injectedAccount) {
      alert('Invalid provider.');
    } else {
      close();
      await submitAddAccountId(
        $dotApi.api as ApiPromise,
        await getExtension($user),
        selectedAccount,
        $user,
        $user.msaId
      );
    }
  };

  function onCancel() {
    selectedAccount = null;
    close();
  }
</script>

<Modal id="add-account-id" {isOpen} close={onCancel}>
  {#snippet title()}
    <span>
      Add an Account Id to MSA (<span class="font-light">{$user.msaId}</span>)
    </span>
  {/snippet}

  {#snippet body()}
    <form class="column">
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
        <div id="network-error-msg" class="text-sm text-error">
          No available Account Ids. Create a new Account Id without an MSA Id.
        </div>
      {/if}
      <div class="flex w-[350px] justify-between">
        <button onclick={preventDefault(addAccountId)} class="btn-primary" disabled={isSubmitDisabled}
          >Add Account Id</button
        >
        <button onclick={preventDefault(onCancel)} class="btn-no-fill">Cancel</button>
      </div>
    </form>

    <span class="border-1 border-b border-divider"></span>

    <AddKeyRequirements />
  {/snippet}
</Modal>
