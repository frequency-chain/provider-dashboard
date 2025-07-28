<script lang="ts">
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
  }

  let {
    accounts,
    newUser = $bindable(null),
    selectedAccount = $bindable(null),
    accountSelectorTitle,
    accountSelectorPlaceholder,
    accountErrorMsg = $bindable(),
    isLoading,
  }: Props = $props();
  const accountOptions = $derived(selectAccountOptions(accounts));

  let accountChanged = (selectedAccountValue: Selected<string>) => {
    const curAccount: Account | undefined = accounts.get(selectedAccountValue.value);
    if (curAccount) {
      selectedAccount = curAccount;
      newUser = selectedAccount;
    }
  };
</script>

<Select
  id="controlkeys"
  label={accountSelectorTitle}
  onSelectedChange={accountChanged}
  placeholder={accountSelectorPlaceholder}
  options={accountOptions}
  disabled={accounts.size === 0 || isLoading}
  error={accountErrorMsg}
/>
