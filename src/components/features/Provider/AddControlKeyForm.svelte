<script lang="ts">
  import { Account, unusedKeyAccountsStore } from '$lib/stores/accountsStore.js';
  import { getExtension, selectAccountOptions } from '$lib/utils.js';
  import { Button, Select } from '@frequency-chain/style-guide';
  import { user } from '$lib/stores/userStore.js';
  import { submitAddControlKey } from '$lib/connections.js';
  import { dotApi } from '$lib/stores.js';
  import { ApiPromise } from '@polkadot/api';
  import type { Selected } from 'bits-ui';
  import { Dialog } from 'bits-ui';
  import type { OnChangeFn } from '$lib/storeTypes';

  interface Props {
    onCancel: () => void;
    selectedAccount?: Account | null;
  }

  let { onCancel, selectedAccount = $bindable() }: Props = $props();

  let isSubmitDisabled = $derived(selectedAccount?.injectedAccount == null);
  let error: string | undefined = $state();

  const addControlKey = async () => {
    if (!selectedAccount || !selectedAccount.injectedAccount) {
      alert('Please choose an Control Key to add.');
    } else if (!$user.msaId || !$user.injectedAccount) {
      alert('Invalid provider.');
    } else {
      try {
        await submitAddControlKey(
          $dotApi.api as ApiPromise,
          await getExtension($user),
          selectedAccount,
          $user,
          $user.msaId
        );
        onCancel();
      } catch (err) {
        error = (err as Error).message;
      }
    }
  };

  const accountOptions = $derived(selectAccountOptions($unusedKeyAccountsStore));

  let accountChanged: OnChangeFn<Selected<string>> = (selectedAccountValue: Selected<string> | undefined) => {
    error = undefined;
    const curAccount: Account | undefined = selectedAccountValue?.value
      ? $unusedKeyAccountsStore.get(selectedAccountValue.value)
      : undefined;
    if (curAccount) selectedAccount = curAccount;
  };

  $effect(() => {
    if ($unusedKeyAccountsStore.size === 0) {
      error = 'No available Control Keys. Create a new Control Key without an MSA Id.';
    }
  });
</script>

<form class="column gap-f16">
  <Select
    id="AddControlKey"
    label="Control Key to Add"
    placeholder="Select Id..."
    options={accountOptions || []}
    onSelectedChange={accountChanged}
    disabled={$unusedKeyAccountsStore.size === 0}
    {error}
  />

  <Dialog.Close class="text-left">
    <Button onclick={addControlKey} disabled={isSubmitDisabled}>Add Control Key</Button>
  </Dialog.Close>
</form>
