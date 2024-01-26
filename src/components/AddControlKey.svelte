<script lang="ts">
  import { dotApi, transactionSigningAddress, storeMsaInfo } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { submitAddControlKey, type SigningKey } from '$lib/connections';
  import { onMount } from 'svelte';
  import { isFunction } from '@polkadot/util';
  import { isLocalhost } from '$lib/utils';
  import TransactionStatus from './TransactionStatus.svelte';
  import DropDownMenu from './DropDownMenu.svelte';
  import Modal from './Modal.svelte';
  import AddControlKeyRequirements from './AddControlKeyRequirements.svelte';
  // should filter keys to make sure that they are not already associated with another account.
  // to do that, you need to check that a key is not associated with an MSA.
  // call it storeAvailableAccounts.
  import { storeUnusedKeyAccounts } from '$lib/stores/accountsStore';

  export let isOpen = false;
  export let close = () => {};

  let isLoading: boolean = false;
  let selectedKeyToAdd: SigningKey;
  let web3FromSource;
  let web3Enable;
  let showTransactionStatus = false;
  let txnFinished = () => {};
  export let txnStatuses: Array<string> = [];

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    web3FromSource = extension.web3FromSource;
    web3Enable = extension.web3Enable;
  });

  export let providerId = 0;

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());

  const addControlKey = async (evt: Event) => {
    clearTxnStatuses();
    let endpointURI: string = $dotApi.selectedEndpoint || '';
    if (!selectedKeyToAdd) {
      alert('Please choose a key to add.');
    } else {
      let newKeys = selectedKeyToAdd;
      let signingKeys = $transactionSigningAddress;
      showTransactionStatus = true;
      if (isLocalhost(endpointURI)) {
        isLoading = true;
        await submitAddControlKey(
          $dotApi.api as ApiPromise,
          undefined,
          selectedKeyToAdd,
          signingKeys,
          providerId,
          endpointURI as string,
          addNewTxnStatus,
          txnFinished
        );
        isLoading = false;
      } else {
        if (isFunction(web3FromSource) && isFunction(web3Enable)) {
          const extensions = await web3Enable('Frequency parachain provider dashboard: Adding Keys');
          if (extensions.length !== 0) {
            isLoading = true;
            const injectedExtension = await web3FromSource(signingKeys.meta.source);
            await submitAddControlKey(
              $dotApi.api as ApiPromise,
              injectedExtension,
              newKeys,
              signingKeys,
              providerId,
              endpointURI as string,
              addNewTxnStatus,
              txnFinished
            );
            isLoading = false;
          } else {
            console.error('found no extensions');
            return;
          }
        } else {
          console.error('web3FromSource is function? ', isFunction(web3FromSource));
          console.error('web3Enable is function? ', isFunction(web3Enable));
        }
      }
    }
  };
</script>

<Modal id="add-control-key" {isOpen} {close}>
  <h2 class="section-title-underlined">{`Add Control Key to MSA (${$storeMsaInfo?.msaId})`}</h2>

  <DropDownMenu
    id="AddControlKey"
    label="Public Key"
    selected={$transactionSigningAddress}
    options={$storeUnusedKeyAccounts}
    onChange={() => {}}
  />

  <div class="flex justify-between align-bottom">
    <button class="btn-primary" on:click|preventDefault={addControlKey}>Add Key</button>
    <button class="btn-no-fill" on:click|preventDefault={close}>Cancel</button>
  </div>

  <span class="min-w-full border-b border-b-divider" />

  <AddControlKeyRequirements />

  <TransactionStatus bind:isOpen={showTransactionStatus} statuses={txnStatuses} {isLoading} />
</Modal>
