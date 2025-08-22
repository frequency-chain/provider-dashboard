<script lang="ts">
  import { Account, unusedKeyAccountsStore } from '$lib/stores/accountsStore.js';
  import { getExtension, selectAccountOptions } from '$lib/utils.js';
  import { Button, Select } from '@frequency-chain/style-guide';
  import { user } from '$lib/stores/userStore.js';
  import { submitAddControlKey } from '$lib/connections.js';
  import { dotApi } from '$lib/stores.js';
  import { ApiPromise } from '@polkadot/api';
  import type { Selected } from 'bits-ui';
  import type { OnChangeFn } from '$lib/storeTypes';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';

  interface Props {
    selectedAccount?: Account | null;
    modalOpen?: boolean | null;
  }

  let { selectedAccount = $bindable(), modalOpen = $bindable(null) }: Props = $props();

  let error: string | undefined = $state();
  let isLoading: boolean = $state(false);
  let isSubmitDisabled = $derived(selectedAccount?.injectedAccount == null || isLoading);

  const addControlKey = async () => {
    if (!selectedAccount || !selectedAccount.injectedAccount) {
      alert('Please choose an Control Key to add.');
    } else if (!$user.msaId || !$user.injectedAccount) {
      alert('Invalid provider.');
    } else {
      try {
        isLoading = true;
        await submitAddControlKey(
          $dotApi.api as ApiPromise,
          await getExtension($user),
          selectedAccount,
          $user,
          $user.msaId
        );
        modalOpen = false;
      } catch (err) {
        error = (err as Error).message;
        isLoading = false;
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
    let noControlKeysError = 'No available Control Keys. Create a new Control Key without an MSA Id.';
    if ($unusedKeyAccountsStore.size === 0) {
      error = noControlKeysError;
    } else if (error === noControlKeysError) {
      error = undefined;
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

  <Button onclick={addControlKey} disabled={isSubmitDisabled}>
    {#if isLoading}
      <LoadingIcon />
    {:else}
      Add Control Key
    {/if}</Button
  >
</form>
