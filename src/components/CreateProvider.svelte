<script lang="ts">
    import {storeCurrentAction, storeMsaInfo, transactionSigningAddress} from "$lib/stores";
    import {ActionForms} from "$lib/storeTypes";
    import type {MsaInfo} from '$lib/storeTypes';

    let me = ActionForms.CreateProvider;
    export let currentAction: ActionForms;
    export let msaId = 0;
    export let validAccounts: Array<string>
    storeMsaInfo.subscribe((info: MsaInfo) => info?.msaId || 0)
    let localSigningAddress = '0xabcdefbeef';
    transactionSigningAddress.subscribe(addr => localSigningAddress = addr)

    const showSelf = () => {
        currentAction === me
    }
</script>
<div class:hidden={!showSelf}>
    <h2>Become a Provider</h2>
    <p>For developer and testing convenience, on Testnet, anyone with an MSA who wishes to become a Provider may
        simply submit a <code>createProvider</code> transaction.</p>
    <p>This button will register the MSA Id that is controlled by the selected Transaction Signing Address.
        Any control key for the MSA Id can submit the transaction.</p>
    <label for="create-provider">Make {msaId} MSA Id a Provider using address {localSigningAddress}</label>
    <button id="create-provider">Make {msaId} a Provider</button>
</div>
