<script lang="ts">
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import { dotApi } from '$lib/stores';
  import type { MsaInfo } from '$lib/storeTypes';
  import type { ApiPromise } from '@polkadot/api';
  import { getExtension } from '$lib/utils';
  import { submitCreateMsa } from '$lib/connections';
  import TransactionStatus from '$components/TransactionStatus.svelte';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import { pageContent } from '$lib/stores/pageContentStore';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';

  export let updateUser: () => void;
  export let txnStatuses: Array<string> = [];
  // a callback for when the user cancels this action
  export let cancelAction = () => {
    pageContent.login();
  };
  // a callback for when a transaction hits a final state
  // TODO
  let createMsaTxnFinished = async (succeeded: boolean, txnId: string) => {
    if (succeeded) {
      const apiPromise = $dotApi.api as ApiPromise;
      const msaInfo: MsaInfo = await getMsaInfo(apiPromise, $user.address);
      $user.msaId = msaInfo.msaId;
      updateUser();
    }
    isInProgress = false;
  };

  const doCreateMsa = async (_evt: Event) => {
    updateUser();

    isInProgress = true;
    await submitCreateMsa($dotApi.api, await getExtension($user), $user);
    // createMsaTxnFinished()
  };
</script>

<div id="create-msa" class="flex flex-col gap-3.5 text-sm">
  <div class="label">Create MSA Id</div>
  <p>
    An MSA (Message Source Account) is required to become a provider. This action will create an MSA Id that is
    controlled by the selected Transaction Signing Address above. It is available only on Frequency Testnet.
  </p>
  <form class="flex w-[350px] items-end justify-between">
    <button id="create-msa-btn" on:click|preventDefault={doCreateMsa} disabled={isInProgress} class="btn-primary">
      {#if isInProgress}
        <LoadingIcon />
      {:else}
        Create an MSA
      {/if}</button
    >
    <button on:click|preventDefault={cancelAction} class="btn-no-fill">Cancel</button>
  </form>
</div>
