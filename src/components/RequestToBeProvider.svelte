<script lang="ts">
    import {ActionForms} from "$lib/storeTypes";

    const me: ActionForms = ActionForms.RequestToBeProvider
    let msaId = 0;
    export let currentAction = ActionForms.NoForm;
    export let validAccounts: Array<string> = [];
/*    storeCurrentAction.subscribe( action => showSelf = action === ActionForms.RequestToBeProvider)
    storeMsaInfo.subscribe((info: MsaInfo) => info?.msaId || 0)
    let localSigningAddress = '0xabcdefbeef';
    transactionSigningAddress.subscribe(addr => localSigningAddress = addr) */
    const shouldShowSelf = () => {
        if ( currentAction === undefined) return false;
        return currentAction === me
    }
    const hideSelf = () => {
        currentAction = ActionForms.NoForm
    }
</script>
<div id='request-to-be-provider' class:hidden={!shouldShowSelf()}>
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
        <li>Submit an on-chain transaction to request be become a provider by filling in and submitting the form below.</li>
        <li>Contact the Frequency Council and inform them that you have requested to become a Provider, and provide them with your MSA Id.</li>
    </ol>
    <form>
        <label for="providerNameRtB">Provider name, less than 8 letters</label>
        <input id="providerNameRtB" placeholder="Short name" maxlength="8"/>
        <button id="request-2b-provider-btn">Submit Request To Be Provider</button>
        <button on:click={hideSelf}>Cancel</button>
    </form>
</div>
