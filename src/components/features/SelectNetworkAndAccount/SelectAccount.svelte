<script lang="ts">
  import type { Account, Accounts } from '$lib/stores/accountsStore';
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
    accountErrorMsg,
    isLoading,
  }: Props = $props();

  const allAccounts = $derived(Array.from(accounts.values()));
  $effect(() => console.log('allAccounts: ', allAccounts));

  const accountOptions = $derived(
    allAccounts.map((account) => ({
      optionLabel: `${account.display}: ${account.address}`,
      value: account.address,
    }))
  );

  let accountChanged = (selectedAccountValue: Selected<string>) => {
    const curAccount: Account | undefined = allAccounts.find(
      (account) => account.address === selectedAccountValue.value
    );
    if (curAccount) {
      selectedAccount = curAccount;
      newUser = selectedAccount;
    }
  };

  function findMatchingAccount(): Account | null {
    for (const account of accounts.values()) {
      if (JSON.stringify(account) === JSON.stringify(selectedAccount)) return account;
    }
    return null;
  }

  $effect(() => {
    if (accounts && selectedAccount) {
      const match = findMatchingAccount();
      if (match && match !== selectedAccount) {
        selectedAccount = match;
      }
    }
  });
</script>

<Select
  id="controlkeys"
  label={accountSelectorTitle}
  onSelectedChange={accountChanged}
  placeholder={accountSelectorPlaceholder}
  options={accountOptions}
  disabled={accounts.size === 0 || isLoading}
/>
{#if accountErrorMsg}
  <div id="controlkey-error-msg" class="text-error smText">{accountErrorMsg}</div>
{/if}
