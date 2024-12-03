<script lang="ts">
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
  import { Button } from '@frequency-chain/style-guide';

  interface Props {
    isOpen: boolean;
    close: () => void;
  }

  let { isOpen, close }: Props = $props();

  let selectedAccount: Account | null | undefined = $state();

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
  <span slot="title">
    Add an Account Id to MSA (<span class="font-light">{$user.msaId}</span>)
  </span>

  <div slot="body">
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
        <Button class="btn-primary" onClick={addAccountId} disabled={isSubmitDisabled}>Add Account Id</Button>
        <button class="underline transition hover:text-teal" onclick={onCancel}>Cancel</button>
      </div>
    </form>

    <span class="border-1 border-divider border-b"></span>

    <AddKeyRequirements />
  </div>
</Modal>
