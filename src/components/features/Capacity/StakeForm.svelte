<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo, dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake } from '$lib/connections';
  import { getExtension, selectAccountOptions } from '$lib/utils';
  import { Button, Input, Select } from '@frequency-chain/style-guide';
  import { type Account, providerAccountsStore } from '$lib/stores/accountsStore';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';

  let { modalOpen = $bindable(null) } = $props();

  let stakeAmount = $state(1n);

  let accountValue = $state<string | undefined>();
  let selectedAccount: Account | null = $derived($providerAccountsStore.get(accountValue ?? '') ?? null);

  let isLoading = $state(false);
  let error: string | undefined = $state();
  $effect(() => {
    if (accountValue) error = undefined;
  });

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
    isLoading = true;

    if ($user.msaId === undefined || $user.msaId === 0) {
      error = 'Undefined MSA ID';
      return;
    }
    if (!selectedAccount) throw new Error('Account not selected');

    try {
      const extension = await getExtension($user);
      await submitStake($dotApi.api as ApiPromise, extension, selectedAccount, $user.msaId, stakeAmountInPlancks);
      modalOpen = false;
    } catch (err) {
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };

  const accountOptions = $derived(selectAccountOptions($providerAccountsStore));
</script>

<form class="column gap-f16" data-testid="stake-form">
  <Select
    bind:value={accountValue}
    disabled={$providerAccountsStore.size === 0 || isLoading}
    id="stake-using-account-id"
    label="Wallet Control Key"
    placeholder="Select Control Key"
    options={accountOptions}
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
