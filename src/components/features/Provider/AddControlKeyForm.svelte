<script lang="ts">
  import { Account, unusedKeyAccountsStore } from '$lib/stores/accountsStore.js';
  import { formatAccount, getExtension } from '$lib/utils.js';
  import DropDownMenu from '$atoms/DropDownMenu.svelte';
  import { Button } from '@frequency-chain/style-guide';
  import { user } from '$lib/stores/userStore.js';
  import { submitAddControlKey } from '$lib/connections.js';
  import { dotApi } from '$lib/stores.js';
  import { ApiPromise } from '@polkadot/api';
  import ButtonNoFill from '$atoms/ButtonNoFill.svelte';

  interface Props {
    onCancel: () => void;
    selectedAccount?: Account | null;
  }

  let { onCancel, selectedAccount = $bindable() }: Props = $props();

  let isSubmitDisabled = $derived(selectedAccount?.injectedAccount == null);

  const addControlKey = async () => {
    if (!selectedAccount || !selectedAccount.injectedAccount) {
      alert('Please choose an Control Key to add.');
    } else if (!$user.msaId || !$user.injectedAccount) {
      alert('Invalid provider.');
    } else {
      onCancel();
      await submitAddControlKey(
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
    id="AddControlKey"
    label="Control Key to Add"
    placeholder="Select Id..."
    bind:value={selectedAccount}
    options={Array.from($unusedKeyAccountsStore.values()) || []}
    disabled={$unusedKeyAccountsStore.size === 0}
    formatter={formatAccount}
  />
  {#if $unusedKeyAccountsStore.size === 0}
    <div id="network-error-msg" class="text-error text-sm">
      No available Control Keys. Create a new Control Key without an MSA Id.
    </div>
  {/if}

  <div class="flex items-end justify-between">
    <Button onclick={addControlKey} disabled={isSubmitDisabled}>Add Control Key</Button>
    <ButtonNoFill onclick={onCancel}>Cancel</ButtonNoFill>
  </div>
</form>
