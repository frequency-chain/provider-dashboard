<script lang="ts">
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import { dotApi } from '$lib/stores';
  import type { MsaInfo } from '$lib/storeTypes';
  import type { ApiPromise } from '@polkadot/api';
  import { isLocalhost } from '$lib/utils';
  import { submitCreateMsa, type TxnFinishedCallback } from '$lib/connections';
  import TransactionStatus from '$components/TransactionStatus.svelte';
  import { isFunction } from '@polkadot/util';
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/userStore';
  import { getMsaInfo } from '$lib/polkadotApi';
  import { pageContent } from '$lib/stores/pageContentStore';

  export let beforeCreate: () => Promise<void>;
  export let txnStatuses: Array<string> = [];
  // a callback for when the user cancels this action
  export let cancelAction = () => {
    pageContent.login();
  };
  // a callback for when a transaction hits a final state
  export let txnFinished: TxnFinishedCallback = async (succeeded: boolean) => {
    if (succeeded) {
      const apiPromise = $dotApi.api as ApiPromise;
      const msaInfo: MsaInfo = await getMsaInfo(apiPromise, $user.address);
      $user.msaId = msaInfo.msaId;
    }
  };

  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;
  let showTransactionStatus = false;

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

  const doCreateMsa = async (_evt: Event) => {
    await beforeCreate();
    const endpoint: string | undefined = $user.network?.endpoint;
    if (!endpoint) {
      alert('Error connecting to endpoint.');
      return;
    }
    clearTxnStatuses();
    showTransactionStatus = true;
    const apiPromise = $dotApi.api as ApiPromise;
    if (isLocalhost(endpoint)) {
      await submitCreateMsa(apiPromise, undefined, endpoint, $user.signingKey!, addNewTxnStatus, txnFinished);
    } else {
      if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
        const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Creating provider');
        if (extensions.length !== 0) {
          const injectedExtension = await thisWeb3FromSource($user.signingKey!.meta.source!);
          await submitCreateMsa(
            apiPromise,
            injectedExtension,
            endpoint,
            $user.signingKey!,
            addNewTxnStatus,
            txnFinished
          );
        }
      }
    }
  };

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
    return;
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());
</script>

<div id="create-msa" class="flex flex-col gap-3.5 text-sm">
  <div class="label">Create MSA Id</div>
  <p>
    An MSA (Message Source Account) is required to become a provider. This action will create an MSA Id that is
    controlled by the selected Transaction Signing Address above. It is available only on Frequency Testnet.
  </p>
  <form class="flex w-[350px] items-end justify-between">
    <button id="create-msa-btn" on:click|preventDefault={doCreateMsa} class="btn-primary">Create an MSA</button>
    <button on:click|preventDefault={cancelAction} class="btn-no-fill">Cancel</button>
  </form>
</div>
<TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
