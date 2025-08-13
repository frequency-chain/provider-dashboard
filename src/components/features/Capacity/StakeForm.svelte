<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo } from '$lib/stores';
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake } from '$lib/connections';
  import { getExtension, selectAccountOptions } from '$lib/utils';
  import { Button, Input, Select } from '@frequency-chain/style-guide';
  import { Dialog } from 'bits-ui';
  import { type Account, providerAccountsStore } from '$lib/stores/accountsStore';
  import type { Selected } from 'bits-ui';

  let stakeAmount = $state(1n);

  let selectedAccount: Account | null = $state(null);
  let isLoading: boolean = $state(false);
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

  const stake = async (_evt: Event) => {
    if ($user.msaId === undefined || $user.msaId === 0) throw new Error('Undefined MSA ID');
    if (!selectedAccount) throw new Error('Account not selected');
    isLoading = true;
    try {
      await submitStake(
        $dotApi.api as ApiPromise,
        await getExtension($user),
        selectedAccount,
        $user.msaId,
        stakeAmountInPlancks
      );
      close();
    } catch (err) {
      error = (err as Error).message;
    }
    isLoading = false;
  };

  const accountOptions = $derived(selectAccountOptions($providerAccountsStore));

  let accountChanged = (selectedAccountValue: Selected<string> | undefined) => {
    error = '';
    const curAccount = (selectedAccountValue?.value && $providerAccountsStore.get(selectedAccountValue.value)) || null;
    if (curAccount) selectedAccount = curAccount;
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
    disabled={false}
  />

  <Dialog.Close class="text-left">
    <Button onclick={stake} disabled={isLoading || !selectedAccount || stakeAmount <= 0}>Stake</Button>
  </Dialog.Close>
</form>
