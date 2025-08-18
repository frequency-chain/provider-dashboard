<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo, dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake } from '$lib/connections';
  import { getExtension, selectAccountOptions } from '$lib/utils';
  import { Button, Input, Select } from '@frequency-chain/style-guide';
  import { type Account, providerAccountsStore } from '$lib/stores/accountsStore';
  import type { Selected } from 'bits-ui';

  let { modalOpen = $bindable(null) } = $props();

  let stakeAmount = $state(1n);
  let selectedAccount: Account | null = $state(null);
  let isLoading = $state(false);
  let error: string | undefined = $state();

  let stakeAmountInPlancks = $derived(BigInt.asUintN(64, stakeAmount) * BigInt.asUintN(64, DOLLARS));

  function handleInput(evt: Event) {
    error = '';
    const target = evt.target as HTMLInputElement;
    if (target !== null && target.value === '') {
      stakeAmount = 0n;
    } else if (target !== null && target.value !== null) {
      stakeAmount = BigInt(target.value);
      return;
    }
  }

  const stake = async (e: Event) => {
    e.preventDefault();
    if ($user.msaId === undefined || $user.msaId === 0) {
      error = 'Undefined MSA ID';
      return;
    }
    if (!selectedAccount) {
      error = 'Account not selected';
      return;
    }

    isLoading = true;
    try {
      await submitStake(
        $dotApi.api as ApiPromise,
        await getExtension($user),
        selectedAccount,
        $user.msaId,
        stakeAmountInPlancks
      );
      modalOpen = false;
    } catch (err) {
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };

  const accountOptions = $derived(selectAccountOptions($providerAccountsStore));

  const accountChanged = (selectedAccountValue: Selected<string> | undefined) => {
    error = '';
    selectedAccount = selectedAccountValue?.value
      ? ($providerAccountsStore.get(selectedAccountValue.value) ?? null)
      : null;
  };
</script>

<form class="column gap-f16">
  <Select
    disabled={$providerAccountsStore.size === 0 || isLoading}
    id="stake-using-account-id"
    label="Wallet Control Key"
    placeholder="Select Control Key"
    options={accountOptions}
    onSelectedChange={accountChanged}
  />

  <Input
    id="stakingInput"
    type="number"
    label={`Amount in ${$storeChainInfo.token}`}
    min="0"
    value="1"
    oninput={handleInput}
    {error}
    disabled={isLoading}
  />

  <!-- prevent default form submit -->
  <Button onclick={stake} disabled={isLoading || !selectedAccount || stakeAmount <= 0}>
    {isLoading ? 'Staking…' : 'Stake'}
  </Button>
</form>
