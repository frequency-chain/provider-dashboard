<script lang="ts">
  import { preventDefault } from 'svelte/legacy';
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo } from '$lib/stores';
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake } from '$lib/connections';
  import { formatAccount, getExtension } from '$lib/utils';
  import DropDownMenu from './DropDownMenu.svelte';
  import { type Account, allAccountsStore } from '$lib/stores/accountsStore';
  import { Button } from '@frequency-chain/style-guide';

  interface Props {
    close: () => void;
    stakeAmount?: bigint;
  }

  let { close, stakeAmount = $bindable(1n) }: Props = $props();

  let selectedAccount: Account | null = $state($allAccountsStore.get($user.address) || null);
  let isLoading: boolean = $state(false);

  let stakeAmountInPlancks = $derived(BigInt.asUintN(64, stakeAmount) * BigInt.asUintN(64, DOLLARS));

  function handleInput(evt: Event) {
    const target = evt.target as HTMLInputElement;
    if (target !== null && target.value === '') {
      stakeAmount = 0n;
    } else if (target !== null && target.value !== null) {
      stakeAmount = BigInt(target.value);
      return;
    }
  }

  const stake = async (_evt: Event) => {
    if ($user.msaId === undefined || $user.msaId === 0) throw new Error('Undefined MSA ID');
    if (!selectedAccount) throw new Error('Account not selected');
    close();
    isLoading = true;
    await submitStake(
      $dotApi.api as ApiPromise,
      await getExtension($user),
      selectedAccount,
      $user.msaId,
      stakeAmountInPlancks
    );
    isLoading = false;
  };
</script>

<form class="column gap-f16">
  <DropDownMenu
    id="stake-using-account-id"
    label="Wallet Account Id"
    bind:value={selectedAccount}
    placeholder="Select Account Id"
    options={Array.from($allAccountsStore.values())}
    formatter={formatAccount}
  />

  <div class="column gap-f8">
    <label class="form-item-label text-[16px]" for="stakingInput">
      Amount in <span class="units">{$storeChainInfo.token}</span>
    </label>

    <input
      id="stakingInput"
      class="border-input aria-[invalid]:border-destructive [&>span]:data-placeholder:text-muted-foreground sm border-error outline-gray3 flex h-10 w-full max-w-[420px] items-center justify-between rounded-md border-2 bg-white px-3 py-2 text-[16px] outline outline-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
      type="number"
      min="0"
      value="1"
      oninput={handleInput}
    />
  </div>

  <div class="flex items-end justify-between">
    <Button
      type="primary"
      onclick={stake}
      disabled={isLoading}
      class="disabled:bg-gray3 disabled:text-white disabled:hover:shadow-none"
    >
      Stake</Button
    >
    <button class="btn-no-fill hover:text-teal text-sm underline" onclick={preventDefault(close)}>Cancel</button>
  </div>
</form>
