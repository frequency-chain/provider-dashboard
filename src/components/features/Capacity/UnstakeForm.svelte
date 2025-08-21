<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo } from '$lib/stores';
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitUnstake } from '$lib/connections';
  import { getExtension, selectAccountOptions } from '$lib/utils';
  import { type Account, providerAccountsStore } from '$lib/stores/accountsStore';
  import { Button, Input, Select } from '@frequency-chain/style-guide';
  import type { Selected } from 'bits-ui';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';

  let unstakeAmount = $state(1n);
  let selectedAccount: Account | null = $state(null);
  let isLoading: boolean = $state(false);
  let error: string | undefined = $state();

  let { modalOpen = $bindable(null) } = $props();

  let unstakeAmountInPlancks = $derived(BigInt.asUintN(64, unstakeAmount) * BigInt.asUintN(64, DOLLARS));

  function handleInput(evt: Event) {
    error = '';
    const target = evt.target as HTMLInputElement;
    if (target !== null && target.value === '') {
      unstakeAmount = 0n;
    } else if (target !== null && target.value !== null) {
      unstakeAmount = BigInt(target.value);
      return;
    }
  }

  const unstake = async (_evt: Event) => {
    if ($user.msaId === undefined || $user.msaId === 0) throw new Error('Undefined MSA ID');
    if (!selectedAccount) throw new Error('Account not selected');
    isLoading = true;
    try {
      await submitUnstake(
        $dotApi.api as ApiPromise,
        await getExtension($user),
        selectedAccount,
        $user.msaId,
        unstakeAmountInPlancks
      );
      modalOpen = false;
    } catch (err) {
      error = (err as Error).message;
    }
    isLoading = false;
  };

  const controlKeyOptions = $derived(selectAccountOptions($providerAccountsStore));

  let controlKeyChanged = (selectedAccountValue: Selected<string> | undefined) => {
    error = '';
    const curAccount: Account | undefined = selectedAccountValue?.value
      ? $providerAccountsStore.get(selectedAccountValue.value)
      : undefined;
    if (curAccount) selectedAccount = curAccount;
  };
</script>

<form class="column gap-f16">
  <Select
    id="unstake-using-account-id"
    label="Wallet Control Key"
    onSelectedChange={controlKeyChanged}
    placeholder="Select Control Key"
    options={controlKeyOptions}
    disabled={$providerAccountsStore.size === 0}
  />

  <Input
    id="unstakingInput"
    type="number"
    label={`Amount in ${$storeChainInfo.token}`}
    min="0"
    value="1"
    oninput={handleInput}
    {error}
    disabled={false}
  />

  <Button onclick={unstake} disabled={isLoading || !selectedAccount || unstakeAmount <= 0}
    >{#if isLoading}
      <LoadingIcon />
    {:else}
      Stake
    {/if}</Button
  >
</form>
