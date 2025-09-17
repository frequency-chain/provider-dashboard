<script lang="ts">
  import AddToClipboard from '$atoms/AddToClipboard.svelte';
  import { type Account, type Accounts } from '$lib/stores/accountsStore';
  import { selectAccountOptions } from '$lib/utils';
  import { Select } from '@frequency-chain/style-guide';

  interface Props {
    accounts: Accounts;
    accountValue?: Account['address'];
    accountSelectorTitle: string;
    accountSelectorPlaceholder: string;
    accountErrorMsg: string;
    isLoading: boolean;
    canCopyAddress?: boolean;
  }

  let {
    accounts,
    accountValue = $bindable(),
    accountSelectorTitle,
    accountSelectorPlaceholder,
    accountErrorMsg = $bindable(),
    isLoading,
    canCopyAddress = false,
  }: Props = $props();

  const accountOptions = $derived(selectAccountOptions(accounts));
</script>

<div class="flex items-end gap-2">
  <div class="max-w-[388px] flex-1">
    <Select
      bind:value={accountValue}
      id="controlkeys"
      label={accountSelectorTitle}
      placeholder={accountSelectorPlaceholder}
      options={accountOptions}
      disabled={accounts.size === 0 || isLoading}
      error={accountErrorMsg}
    />
  </div>

  {#if canCopyAddress}
    <AddToClipboard classes="my-2" copyValue={accountValue} disabled={!accountValue} />
  {/if}
</div>
