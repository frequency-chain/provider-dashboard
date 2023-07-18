<script lang="ts">
    import {dotApi, storeConnected, storeCurrentAction, transactionSigningAddress} from "$lib/stores";
    import type {ApiPromise} from "@polkadot/api";
    import { submitAddControlKey } from "$lib/connections";
    import {ActionForms, defaultDotApi} from "$lib/storeTypes";
    import KeySelection from "./KeySelection.svelte";
    import {onMount} from "svelte";
    import {isFunction} from "@polkadot/util";
    import { isLocalhost} from "$lib/utils";

    let connected = false;
    let thisDotApi = defaultDotApi;
    let signingAddress: string = '';
    let showSelf: boolean = false;
    let selectedKey: string = '';
    let web3FromSource;
    let web3Enable;

    onMount(async () => {
        const extension = await import("@polkadot/extension-dapp");
        web3FromSource = extension.web3FromSource;
        web3Enable = extension.web3Enable;
    })

    export let providerId = 0;
    export let validAccounts = {};

    storeConnected.subscribe(val => connected = val);
    dotApi.subscribe(api => thisDotApi = api);
    transactionSigningAddress.subscribe(val => signingAddress = val);
    storeCurrentAction.subscribe(val => showSelf = val == ActionForms.AddControlKey);

    const hideSelf = () => {
        storeCurrentAction.update(val => val = ActionForms.NoForm);
    }

    const addControlKey = async (evt: Event) => {
        let endpointURI: string = thisDotApi.selectedEndpoint || '';
        evt.preventDefault();
        if (selectedKey === '') {
            alert("Please choose a key to add.")
        } else if (isFunction(web3FromSource) && isFunction(web3Enable)){
            let newKeys = validAccounts[selectedKey];
            let signingKeys = validAccounts[signingAddress]
            if (isLocalhost(endpointURI)) {
                await submitAddControlKey(thisDotApi.api as ApiPromise, undefined,  newKeys, signingKeys, providerId, endpointURI as string);
            } else {
                const extensions = web3Enable('Frequency parachain provider dashboard: Adding Keys');
                if (extensions.length !== 0) {
                    const injectedExtension = await web3FromSource(signingKeys.meta.source);
                    await submitAddControlKey(thisDotApi.api as ApiPromise, injectedExtension,  newKeys, signingKeys, providerId, endpointURI as string);
                }
            }
        }
    }
</script>
<div class={connected && showSelf ? "" : "hidden"}>
    <h3>Add a Control Key to {providerId}</h3>
    <p>Requirements</p>
    <ol>
        <li>Ensure the new control key has a FRQCY balance if you intend to use it for submitting FRQCY or Capacity transactions.</li>
        <li>Ensure the new control key is imported into your wallet.</li>
        <li>Select the new control key from the dropdown list.</li>
        <li>Click the Add Key button.</li>
        <li>This will require 3 signatures: two for the authorization payload, and one to send the transaction.</li>
            <ul>
                <li>Sign with the new control key</li>
                <li>Sign with the current control key</li>
                <li>Sign the transaction with the current control key</li>
            </ul>
    </ol>
    <form>
        <KeySelection
                component="AddControlKey"
                selectLabel="Key to Add"
                bind:selectedOption={selectedKey}
                {validAccounts}
        />
        <button on:click={addControlKey}>Add It</button>
    </form>
    <button on:click={hideSelf}>Cancel</button>
</div>