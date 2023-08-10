<script lang="ts">
    import RequestToBeProvider from "./RequestToBeProvider.svelte";
    import CreateProvider from "./CreateProvider.svelte";
    import AddControlKey from "$components/AddControlKey.svelte";
    import {ActionForms} from "$lib/storeTypes.js";
    import type {MsaInfo} from '$lib/storeTypes';

    import {storeCurrentAction, storeMsaInfo, transactionSigningAddress, storeValidAccounts} from "$lib/stores.js";

    let msaInfo: MsaInfo = {isProvider: false, msaId: 0, providerName: ''};
    let currentAction: ActionForms = ActionForms.NoForm;
    let signingAddress = '';
    let validAccounts: Array<string> = [];

    storeCurrentAction.subscribe((val) => (currentAction = val));
    storeMsaInfo.subscribe((info: MsaInfo) => msaInfo = info);
    storeValidAccounts.subscribe((accts: Array<string>) => validAccounts = accts);
    transactionSigningAddress.subscribe(addr => signingAddress = addr);
    const providerId = () => {
        return msaInfo?.isProvider ? msaInfo?.msaId : 0
    }

    const cancelAction = () => {
        storeCurrentAction.set(ActionForms.NoForm);
    }

    // Trigger updates in other components if/when a provider action succeeds
    const txnFinished = () => {
        let thisAddr = signingAddress
        // this is b/c SvelteKit is 'smart' and won't update if the value isn't changed.
        transactionSigningAddress.set("")
        transactionSigningAddress.set(thisAddr)
        // for objects, it is not that smart.
        storeMsaInfo.update((info: MsaInfo) => info = {...info, msaId: msaInfo.msaId })
    }

</script>
{#if currentAction === ActionForms.AddControlKey}
    <AddControlKey providerId={providerId()} {validAccounts} {cancelAction}/>
{:else if currentAction === ActionForms.CreateProvider}
    <CreateProvider {validAccounts} {signingAddress} {cancelAction} {txnFinished}/>
{:else if currentAction === ActionForms.RequestToBeProvider}
    <RequestToBeProvider {cancelAction} {validAccounts} {txnFinished}/>
{/if}