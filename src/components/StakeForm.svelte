<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo } from '$lib/stores';
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake, type TxnFinishedCallback } from '$lib/connections';
  import { onMount } from 'svelte';
  import { isFunction } from '@polkadot/util';
  import { formatAccount, isLocalhost } from '$lib/utils';
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import DropDownMenu from './DropDownMenu.svelte';
  import { type Account, allAccountsStore } from '$lib/stores/accountsStore';

  export let close: () => void;
  export let showTransactionStatus: boolean = false;
  export let txnStatuses: Array<string> = [];
  export let stakeAmount: bigint = 1n;
  export let providerId = 0;
  export let txnFinished: TxnFinishedCallback = (succeeded: boolean) => {};

  let selectedAccount: Account = $user;
  let isLoading: boolean = false;
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

  $: stakeAmountInPlancks = BigInt.asUintN(64, stakeAmount) * BigInt.asUintN(64, DOLLARS);

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());

  function handleInput(evt: Event) {
    const target = evt.target as HTMLInputElement;
    if (target !== null && target.value === '') {
      stakeAmount = 0n;
    } else if (target !== null && target.value !== null) {
      stakeAmount = BigInt(target.value);
      return;
    }
  }

  const stake = async (evt: Event) => {
    isLoading = true;
    clearTxnStatuses();
    let endpointURI: string = $dotApi.selectedEndpoint || '';
    showTransactionStatus = true;
    if (isLocalhost(endpointURI)) {
      await submitStake(
        $dotApi.api as ApiPromise,
        undefined,
        $user.signingKey!,
        providerId,
        stakeAmountInPlancks,
        endpointURI,
        addNewTxnStatus,
        txnFinished
      );
    } else {
      if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
        const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Adding Keys');
        if (extensions.length !== 0) {
          const injectedExtension = await thisWeb3FromSource($user.signingKey!.meta.source!);
          await submitStake(
            $dotApi.api as ApiPromise,
            injectedExtension,
            $user.signingKey!,
            providerId,
            stakeAmountInPlancks,
            endpointURI,
            addNewTxnStatus,
            txnFinished
          );
        }
      }
    }
    isLoading = false;
  };
</script>

<form class="column">
  <DropDownMenu
    id="stake-using-key"
    label="Wallet Address"
    bind:value={selectedAccount}
    options={Array.from($allAccountsStore.values())}
    formatter={formatAccount}
  />
  <div>
    <label for="stakingInput" class="label mb-3.5 block">
      Amount in <span class="units">{$storeChainInfo.token}</span>
    </label>
    <input type="number" id="stakingInput" min="0" value="1" on:input={handleInput} />
  </div>

  <div class="flex w-[350px] items-end justify-between">
    <button on:click|preventDefault={stake} class="btn-primary" aria-label="Stake" disabled={isLoading}>Stake</button>
    <button class="btn-no-fill" on:click|preventDefault={close}>Cancel</button>
  </div>
</form>
