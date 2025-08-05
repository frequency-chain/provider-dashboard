<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo } from '$lib/stores';
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitUnstake } from '$lib/connections';
  import { formatAccount, getExtension } from '$lib/utils';
  import DropDownMenu from '../../atoms/DropDownMenu.svelte';
  import { type Account, allAccountsStore } from '$lib/stores/accountsStore';
  import { Button } from '@frequency-chain/style-guide';
  import ButtonNoFill from '$atoms/ButtonNoFill.svelte';

  interface Props {
    close: () => void;
    unstakeAmount?: bigint;
  }

  let { close, unstakeAmount = $bindable(1n) }: Props = $props();

  let selectedAccount: Account | null = $state($allAccountsStore.get($user.address) || null);
  let isLoading: boolean = $state(false);

  let unstakeAmountInPlancks = $derived(BigInt.asUintN(64, unstakeAmount) * BigInt.asUintN(64, DOLLARS));

  function handleInput(evt: Event) {
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
    close();
    isLoading = true;
    await submitUnstake(
      $dotApi.api as ApiPromise,
      await getExtension($user),
      selectedAccount,
      $user.msaId,
      unstakeAmountInPlancks
    );
    isLoading = false;
  };
</script>

<form class="column gap-f16">
  <DropDownMenu
    id="unstake-using-account-id"
    label="Wallet Control Key"
    bind:value={selectedAccount}
    placeholder="Select Control Key"
    options={Array.from($allAccountsStore.values())}
    formatter={formatAccount}
  />

  <div class="column gap-f8">
    <label class="form-item-label text-[16px]" for="unstakingInput">
      Amount in <span class="units">{$storeChainInfo.token}</span>
    </label>

    <input id="unstakingInput" type="number" min="0" value="1" oninput={handleInput} />
  </div>

  <div class="flex items-end justify-between">
    <Button onclick={unstake} disabled={isLoading}>Unstake</Button>
    <ButtonNoFill onclick={close}>Cancel</ButtonNoFill>
  </div>
</form>
