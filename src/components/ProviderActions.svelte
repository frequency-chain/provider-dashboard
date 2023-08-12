<script lang="ts">
  import AddControlKey from '$components/AddControlKey.svelte';
  import CreateProvider from './CreateProvider.svelte';
  import RequestToBeProvider from './RequestToBeProvider.svelte';
  import Stake from './Stake.svelte';
  import { ActionForms } from '$lib/storeTypes.js';
  import type { MsaInfo } from '$lib/storeTypes';

  import { storeCurrentAction, storeMsaInfo, transactionSigningAddress, dotApi } from '$lib/stores.js';
  import { isMainnet } from '$lib/utils';

  let msaInfo: MsaInfo = { isProvider: false, msaId: 0, providerName: '' };
  let currentAction: ActionForms = ActionForms.NoForm;
  let signingAddress = '';
  export let validAccounts = {};
  let network: string = '';

  storeCurrentAction.subscribe((val) => (currentAction = val));
  storeMsaInfo.subscribe((info: MsaInfo) => (msaInfo = info));
  transactionSigningAddress.subscribe((addr) => (signingAddress = addr));
  const providerId = () => {
    return msaInfo?.isProvider ? msaInfo?.msaId : 0;
  };

  dotApi.subscribe((storeDotApi) => {
    network = storeDotApi?.selectedEndpoint || '';
  });

  const cancelAction = () => {
    storeCurrentAction.set(ActionForms.NoForm);
  };

  // Trigger updates in other components if/when a provider action succeeds
  const txnFinished = () => {
    let thisAddr = signingAddress;
    // this is b/c SvelteKit is 'smart' and won't update if the value isn't changed.
    transactionSigningAddress.set('');
    transactionSigningAddress.set(thisAddr);
    // for objects, it is not that smart.
    storeMsaInfo.update((info: MsaInfo) => (info = { ...info, msaId: msaInfo.msaId }));
  };

  function showAddControlKey() {
    storeCurrentAction.set(ActionForms.AddControlKey);
  }

  function showStake() {
    storeCurrentAction.update((val) => (val = ActionForms.Stake));
  }
  // Show RequestToBeProvider if we are Mainnet, show CreateProvider otherwise.
  function showCreateOrRequestProvider(_evt: Event) {
    const currentAction: ActionForms = isMainnet(network)
      ? ActionForms.RequestToBeProvider
      : ActionForms.CreateProvider;
    storeCurrentAction.set(currentAction);
  }
  const actionButtonClasses = 'mt-6 ml-8 px-8 p-2 rounded-2xl text-white border-black bg-aqua';
</script>

{#if msaInfo?.isProvider}
  <button on:click|preventDefault={showAddControlKey} class={actionButtonClasses}> Add control key </button>
  <button on:click={showStake} class={actionButtonClasses}> Stake To Provider </button>
{:else if msaInfo?.msaId > 0}
  <button
    on:click|preventDefault={showCreateOrRequestProvider}
    class:hidden={signingAddress === ''}
    class={actionButtonClasses}
  >
    Become a Provider
  </button>
{/if}

{#if currentAction === ActionForms.AddControlKey}
  <AddControlKey providerId={providerId()} {validAccounts} {cancelAction} />
{:else if currentAction === ActionForms.CreateProvider}
  <CreateProvider {validAccounts} {signingAddress} {cancelAction} {txnFinished} />
{:else if currentAction === ActionForms.RequestToBeProvider}
  <RequestToBeProvider {cancelAction} {validAccounts} {txnFinished} />
{:else if currentAction === ActionForms.Stake}
  <Stake providerId={msaInfo?.isProvider ? msaInfo?.msaId : 0} {validAccounts} {cancelAction} {txnFinished} />
{/if}
