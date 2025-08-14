<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo } from '$lib/stores';
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitUnstake } from '$lib/connections';
  import { getExtension, selectAccountOptions } from '$lib/utils';
  import { type Account, allAccountsStore } from '$lib/stores/accountsStore';
  import { Button, Select } from '@frequency-chain/style-guide';
  import { Dialog, type Selected } from 'bits-ui';

  let unstakeAmount = $state(1n);
  let selectedAccount: Account | null = $state(null);
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

  const controlKeyOptions = $derived(selectAccountOptions($allAccountsStore));

  let controlKeyChanged = (selectedAccountValue: Selected<string> | undefined) => {
    const curAccount: Account | undefined = selectedAccountValue?.value
      ? $allAccountsStore.get(selectedAccountValue.value)
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
    disabled={$allAccountsStore.size === 0}
  />

  <div class="column gap-f8">
    <label class="form-item-label text-[16px]" for="unstakingInput">
      Amount in <span class="units">{$storeChainInfo.token}</span>
    </label>

    <input id="unstakingInput" type="number" min="0" value="1" oninput={handleInput} />
  </div>

  <Dialog.Close class="text-left">
    <Button onclick={unstake} disabled={isLoading || !selectedAccount || unstakeAmount <= 0}>Unstake</Button>
  </Dialog.Close>
</form>
