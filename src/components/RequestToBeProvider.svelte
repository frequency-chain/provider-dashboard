<script lang="ts">
    import {storeCurrentAction, storeMsaInfo, transactionSigningAddress} from "$lib/stores";
    import {ActionForms} from "$lib/storeTypes";
    import type {MsaInfo} from '$lib/storeTypes';

    let showSelf = false;
    let msaId = 0;
/*    storeCurrentAction.subscribe( action => showSelf = action === ActionForms.RequestToBeProvider)
    storeMsaInfo.subscribe((info: MsaInfo) => info?.msaId || 0)
    let localSigningAddress = '0xabcdefbeef';
    transactionSigningAddress.subscribe(addr => localSigningAddress = addr) */
</script>
<div class:hidden={!showSelf}>
    <h2>Request to be a Provider</h2>
    <h3>What is a Provider?</h3>
    <p>A Provider is an MSA holder on Frequency with special permissions.</p>
    <ol>
        <li>They can pay for transactions with Capacity as well as Frequency token.</li>
        <li>They can be permitted to post certain transactions on another MSA's behalf, also known as delegation.</li>
        <li>An MSA can stake token to generate Capacity, and designate a Provider to receive that Capacity.</li>
    </ol>
    <p>Anyone with an MSA ID on Frequency's Mainnet who wants to become a Provider must follow this process:</p>
    <ol>
        <li>Submit an on-chain transaction to request be become a provider.</li>
        <li>Contact the Frequency Council and inform them that you have requested to become a Provider, and provide them with your MSA Id.</li>
    </ol>
    <button>Request MSA {msaId} To Be Provider</button>
</div>
