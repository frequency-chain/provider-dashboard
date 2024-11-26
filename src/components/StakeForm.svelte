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

<form class="column">
  <DropDownMenu
    id="stake-using-account-id"
    label="Wallet Account Id"
    bind:value={selectedAccount}
    placeholder="Select Account Id"
    options={Array.from($allAccountsStore.values())}
    formatter={formatAccount}
  />
  <div>
    <label for="stakingInput" class="label mb-3.5 block">
      Amount in <span class="units">{$storeChainInfo.token}</span>
    </label>
    <input type="number" id="stakingInput" min="0" value="1" oninput={handleInput} />
  </div>

  <div class="flex w-[320px] items-center justify-between">
    <Button size="md" onclick={stake} class="btn-primary" disabled={isLoading}>Stake</Button>

    <button class="btn-no-fill underline hover:text-teal" onclick={preventDefault(close)}>Cancel</button>
  </div>
</form>
