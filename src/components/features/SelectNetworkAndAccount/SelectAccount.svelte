<script lang="ts">
  import AddToClipboard from '$atoms/AddToClipboard.svelte';
  import { type Account, type Accounts } from '$lib/stores/accountsStore';
  import { selectAccountOptions } from '$lib/utils';
  import { Select } from '@frequency-chain/style-guide';
  import type { Selected } from 'bits-ui';

  interface Props {
    accounts: Accounts;
    newUser: Account | null;
    selectedAccount: Account | null;
    accountSelectorTitle: string;
    accountSelectorPlaceholder: string;
    accountErrorMsg: string;
    isLoading: boolean;
    canCopyAddress?: boolean;
  }

  let {
    accounts,
    newUser = $bindable(null),
    selectedAccount = $bindable(null),
    accountSelectorTitle,
    accountSelectorPlaceholder,
    accountErrorMsg = $bindable(),
    isLoading,
    canCopyAddress = false,
  }: Props = $props();
  const accountOptions = $derived(selectAccountOptions(accounts));

  let accountChanged = (selectedAccountValue: Selected<string> | undefined) => {
    const curAccount = (selectedAccountValue?.value && accounts.get(selectedAccountValue.value)) || null;
    if (curAccount) {
      selectedAccount = curAccount;
      newUser = selectedAccount;
    }
  };
</script>

<div class="flex items-end gap-2">
  <div class="max-w-[388px] flex-1">
    <Select
      id="controlkeys"
      label={accountSelectorTitle}
      onSelectedChange={accountChanged}
      placeholder={accountSelectorPlaceholder}
      options={accountOptions}
      disabled={accounts.size === 0 || isLoading}
      error={accountErrorMsg}
    />
  </div>

  {#if canCopyAddress}
    <AddToClipboard classes="my-2" copyValue={selectedAccount?.address} disabled={!selectedAccount?.address} />
  {/if}
</div>
