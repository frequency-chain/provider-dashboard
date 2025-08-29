<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo, dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake } from '$lib/connections';
  import { getExtension, selectAccountOptions } from '$lib/utils';
  import { Button, Input, Select } from '@frequency-chain/style-guide';
  import { type Account, providerAccountsStore } from '$lib/stores/accountsStore';
  import type { Selected } from 'bits-ui';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';

  let { modalOpen = $bindable(null) } = $props();

  let stakeAmount = $state(1n);
  let selectedAccount: Account | null = $state(null);
  let isLoading = $state(false);
  let error: string | undefined = $state();

  let stakeAmountInPlancks = $derived(BigInt.asUintN(64, stakeAmount) * BigInt.asUintN(64, DOLLARS));

  function handleInput(evt: Event) {
    console.log('handleInput', evt?.target?.value!);
    error = '';
    const target = evt.target as HTMLInputElement;
    if (target !== null && target.value === '') {
      stakeAmount = 0n;
    } else if (target !== null && target.value !== null) {
      stakeAmount = BigInt(target.value);
      console.log('stakeAmount', stakeAmount);
      return;
    }
  }

  const stake = async (e: Event) => {
    console.log('here');
    isLoading = true;

    if ($user.msaId === undefined || $user.msaId === 0) {
      console.log('here2');

      error = 'Undefined MSA ID';
      return;
    }
    if (!selectedAccount) {
      console.log('here3');

      error = 'Account not selected';
      return;
    }

    console.log('here4');
    try {
      const extension = await getExtension($user);
      expect(extension).toBeDefined();
      console.log('about to call submitStake');
      await submitStake($dotApi.api as ApiPromise, extension, selectedAccount, $user.msaId, stakeAmountInPlancks);
      modalOpen = false;
    } catch (err) {
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };

  const accountOptions = $derived(selectAccountOptions($providerAccountsStore));

  const accountChanged = (selectedAccountValue: Selected<string> | undefined) => {
    console.log('selectedAccountValue', selectedAccountValue);
    error = '';
    selectedAccount = selectedAccountValue?.value
      ? ($providerAccountsStore.get(selectedAccountValue.value) ?? null)
      : null;
  };

  $effect(() => {
    console.log('isLoading', isLoading);
    console.log('!selectedAccount', !selectedAccount);
    console.log('selectedAccount', selectedAccount);
    console.log('stakeAmount <= 0', stakeAmount <= 0);
  });
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
    data-testid="staking-input"
    type="number"
    label={`Amount in ${$storeChainInfo.token}`}
    placeholder="Amount to stake"
    min="0"
    value="1"
    oninput={handleInput}
    {error}
    disabled={isLoading}
  />

  <!-- prevent default form submit -->
  <Button onclick={stake} disabled={isLoading || !selectedAccount || stakeAmount <= 0}>
    {#if isLoading}
      <LoadingIcon />
    {:else}
      Stake
    {/if}
  </Button>
</form>
