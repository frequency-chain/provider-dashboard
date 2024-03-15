<script lang="ts">
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { submitAddControlKey } from '$lib/connections';
  import { getExtension } from '$lib/utils';
  import AddKeyRequirements from './AddKeyRequirements.svelte';
  import Modal from './Modal.svelte';
  import DropDownMenu from './DropDownMenu.svelte';
  import { user } from '$lib/stores/userStore';
  import { type Account, unusedKeyAccountsStore } from '$lib/stores/accountsStore';
  import { formatAccount } from '$lib/utils';

  export let isOpen: boolean;
  export let close: () => void;

  let selectedAccount: Account | null;

  $: isSubmitDisabled = selectedAccount?.injectedAccount == null;

  const addControlKey = async () => {
    if (!selectedAccount || !selectedAccount.injectedAccount) {
      alert('Please choose a key to add.');
    } else if (!$user.msaId || !$user.injectedAccount) {
      alert('Invalid provider.');
    } else {
      close();
      await submitAddControlKey(
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

<Modal id="add-control-key" {isOpen} close={onCancel}>
  <span slot="title">
    Add a Key to MSA (<span class="font-light">{$user.msaId}</span>)
  </span>

  <svelte:fragment slot="body">
    <form class="column">
      <DropDownMenu
        id="AddControlKey"
        label="Key to Add"
        placeholder="Select Key..."
        bind:value={selectedAccount}
        options={Array.from($unusedKeyAccountsStore.values()) || []}
        disabled={$unusedKeyAccountsStore.size === 0}
        formatter={formatAccount}
      />
      {#if $unusedKeyAccountsStore.size === 0}
        <div id="network-error-msg" class="text-sm text-error">
          No available keys. Create a new account without an MSA Id.
        </div>
      {/if}
      <div class="flex w-[350px] justify-between">
        <button on:click|preventDefault={addControlKey} class="btn-primary" disabled={isSubmitDisabled}>Add Key</button>
        <button on:click|preventDefault={onCancel} class="btn-no-fill">Cancel</button>
      </div>
    </form>

    <span class="border-1 border-b border-divider" />

    <AddKeyRequirements />
  </svelte:fragment>
</Modal>
