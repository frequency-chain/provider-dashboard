<script lang="ts">
    import {storeCurrentAction, storeMsaInfo, transactionSigningAddress} from "$lib/stores";
    import type {MsaInfo} from '$lib/storeTypes';
    import {ActionForms} from "$lib/storeTypes";

    let me = ActionForms.CreateProvider;
    export let currentAction: ActionForms;
    export let msaId = 0;
    export let validAccounts: Array<string>

    storeMsaInfo.subscribe((info: MsaInfo) => info?.msaId || 0)
    let localSigningAddress = '0xabcdefbeef';
    transactionSigningAddress.subscribe(addr => localSigningAddress = addr)

    const shouldShowSelf = () => {
        return currentAction === me
    }
    const hideSelf = () => {
        currentAction = ActionForms.NoForm
    }
</script>
<div id='create-provider' class:hidden={!shouldShowSelf()}>
    <h2>Become a Provider</h2>
    <p>For developer and testing convenience, on Testnet, anyone with an MSA who wishes to become a Provider may
        simply submit a <code>createProvider</code> transaction.</p>
    <p>This action will register the MSA Id that is controlled by the selected Transaction Signing Address above.
        Any control key for the MSA Id can submit the transaction.</p>
    <form>
        <label for="providerNameCB">Provider name, less than 8 letters</label>
        <input id="providerNameCB" placeholder="Short name" maxlength="8"/>
        <button id="create-provider-btn">Create Provider</button>
        <button on:click={hideSelf}>Cancel</button>
    </form>
</div>
