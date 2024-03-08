<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { storeChainInfo } from '$lib/stores';
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { DOLLARS, submitStake } from '$lib/connections';
  import { onMount } from 'svelte';
  import { isFunction } from '@polkadot/util';
  import { formatAccount, isLocalhost } from '$lib/utils';
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import DropDownMenu from './DropDownMenu.svelte';
  import { type Account, allAccountsStore } from '$lib/stores/accountsStore';

  export let close: () => void;
  export let stakeAmount: bigint = 1n;
  export let providerId = 0;

  let selectedAccount: Account;
  let isLoading: boolean = false;
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
    selectedAccount = $allAccountsStore.get($user.address) as Account;
  });

  $: stakeAmountInPlancks = BigInt.asUintN(64, stakeAmount) * BigInt.asUintN(64, DOLLARS);

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
    close();
    isLoading = true;
    let endpointURI: string = $dotApi.selectedEndpoint || '';
    if (isLocalhost(endpointURI)) {
      await submitStake(
        $dotApi.api as ApiPromise,
        undefined,
        $user.signingKey!,
        providerId,
        stakeAmountInPlancks,
        endpointURI
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
            endpointURI
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

  <div class="flex w-[320px] items-end justify-between">
    <button on:click|preventDefault={stake} class="btn-primary" aria-label="Stake" disabled={isLoading}>Stake</button>
    <button class="btn-no-fill" on:click|preventDefault={close}>Cancel</button>
  </div>
</form>
