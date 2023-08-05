<script lang="ts">
    // TODO: this screen shouldn't show if they are already a Provider.
    // TODO: obtain their MSA Id
    import {storeCurrentAction} from "$lib/stores";
    import {ActionForms} from "$lib/storeTypes";

    export let localSigningAddress = '0xabcdefbeef';
    export let isProvider = false;
    export let msaId = 0;
    let showSelf = false;
    storeCurrentAction.subscribe( action => showSelf = action === ActionForms.CreateProvider)
</script>
<h2>Become a Provider</h2>
<p>For developer and testing convenience, on Testnet, anyone with an MSA who wishes to become a Provider may
    simply submit a <code>createProvider</code> transaction.</p>
<p>This button will register the MSA Id that is controlled by the selected Transaction Signing Address.
    Any control key for the MSA Id can submit the transaction.</p>
<label for="create-provider">Make {msaId} MSA Id a Provider using address {localSigningAddress}</label>
<button id="create-provider">Make {msaId} a Provider</button>