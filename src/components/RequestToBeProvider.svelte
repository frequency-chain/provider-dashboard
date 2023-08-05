<script lang="ts">
    import {storeCurrentAction} from "$lib/stores";
    import type {ActionForms} from "$lib/storeTypes";
    import {ActionForms} from "$lib/storeTypes";

    let showSelf = false;
    storeCurrentAction.subscribe( action => showSelf = action === ActionForms.RequestToBeProvider)
</script>
<div class:hidden={showSelf}></div>
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