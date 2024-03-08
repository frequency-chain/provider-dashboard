<script lang="ts">
  import { dotApi } from '$lib/stores';
  import type { ApiPromise } from '@polkadot/api';
  import { submitAddControlKey, type SigningKey } from '$lib/connections';
  import { onMount } from 'svelte';
  import { isFunction } from '@polkadot/util';
  import { isLocalhost } from '$lib/utils';
  import AddKeyRequirements from './AddKeyRequirements.svelte';
  import Modal from './Modal.svelte';
  import DropDownMenu from './DropDownMenu.svelte';
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import { user } from '$lib/stores/userStore';
  import { type Account, unusedKeyAccountsStore } from '$lib/stores/accountsStore';
  import { formatAccount } from '$lib/utils';

  export let isOpen: boolean;
  export let close: () => void;

  let selectedAccount: Account | null;
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;

  let showTransactionStatus = false;

  $: isSubmitDisabled = selectedAccount?.signingKey == null || showTransactionStatus;

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

  const addControlKey = async () => {
    let endpointURI: string = $dotApi.selectedEndpoint || '';

    if (!selectedAccount || !selectedAccount.signingKey) {
      alert('Please choose a key to add.');
    } else if (!$user.msaId || !$user.signingKey) {
      alert('Invalid provider.');
    } else {
      let newKeys: SigningKey = selectedAccount.signingKey;
      let signingKeys: SigningKey = $user.signingKey;
      showTransactionStatus = true;
      if (isLocalhost(endpointURI)) {
        await submitAddControlKey(
          $dotApi.api as ApiPromise,
          undefined,
          newKeys,
          signingKeys,
          $user.msaId,
          endpointURI as string
        );
      } else {
        if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
          const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Adding Keys');
          if (extensions.length !== 0) {
            const injectedExtension = await thisWeb3FromSource(signingKeys.meta.source!);
            await submitAddControlKey(
              $dotApi.api as ApiPromise,
              injectedExtension,
              newKeys,
              signingKeys,
              $user.msaId,
              endpointURI as string
            );
          } else {
            console.error('found no extensions');
            return;
          }
        } else {
          console.error('web3FromSource is function? ', isFunction(thisWeb3FromSource));
          console.error('web3Enable is function? ', isFunction(thisWeb3Enable));
        }
      }
    }
  };

  function onCancel() {
    selectedAccount = null;
    showTransactionStatus = false;
    close();
  }
</script>

<Modal id="add-control-key" {isOpen} close={onCancel}>
  <span slot="title">
    Add a Key to MSA (<span class="font-light">{$user.msaId}</span>)
  </span>

  <svelte:fragment slot="body">
    <form class="column">
      <DropDownMenu
        id="AddControlKey"
        label="Key to Add"
        placeholder="Select Key..."
        bind:value={selectedAccount}
        options={Array.from($unusedKeyAccountsStore.values()) || []}
        disabled={$unusedKeyAccountsStore.size === 0}
        formatter={formatAccount}
      />
      {#if $unusedKeyAccountsStore.size === 0}
        <div id="network-error-msg" class="text-sm text-error">
          No available keys. Create a new account without an MSA Id.
        </div>
      {/if}
      <div class="flex w-[350px] justify-between">
        <button on:click|preventDefault={addControlKey} class="btn-primary" disabled={isSubmitDisabled}>Add Key</button>
        <button on:click|preventDefault={onCancel} class="btn-no-fill">Cancel</button>
      </div>
    </form>

    <span class="border-1 border-b border-divider" />

    <AddKeyRequirements />
  </svelte:fragment>
</Modal>
