<script lang="ts">
    import {dotApi, storeCurrentAction, storeMsaInfo, transactionSigningAddress} from "$lib/stores";
    import type {MsaInfo, DotApi} from '$lib/storeTypes';
    import {ActionForms} from "$lib/storeTypes";
    import type {ApiPromise} from "@polkadot/api";
    import {createProvider} from "$lib/polkadotApi";

    let me = ActionForms.CreateProvider;
    let newProviderName = '';
    let localApi: ApiPromise | undefined;
    export let currentAction: ActionForms;
    export let msaId = 0;

    storeMsaInfo.subscribe((info: MsaInfo) => info?.msaId || 0)
    let localSigningAddress = '0xabcdefbeef';
    transactionSigningAddress.subscribe(addr => localSigningAddress = addr)
    dotApi.subscribe((api: DotApi) => {
        console.log("api: ", api?.api)
        if (api?.api) { localApi = api.api }
    })

    const shouldShowSelf = () => {
        return currentAction === me
    }
    const hideSelf = () => {
        currentAction = ActionForms.NoForm
    }

    const doCreateProvider = async (_evt: Event) => {
        if (newProviderName === '') {
            console.error("please enter a Provider Name");
            return;
        }
        if (!localApi) {
            console.error('please reconnect to an endpoint');
            return;
        }
        console.log("SUCCESS")
        await createProvider(localApi as ApiPromise, localSigningAddress, newProviderName)
    }
</script>
<div id='create-provider' class:hidden={!shouldShowSelf()}>
    <h2>Become a Provider</h2>
    <p>For developer and testing convenience, on Testnet, anyone with an MSA who wishes to become a Provider may
        simply submit a <code>createProvider</code> transaction.</p>
    <p>This action will register the MSA Id that is controlled by the selected Transaction Signing Address above.
        Any control key for the MSA Id can submit the transaction.</p>
    <form>
        <label for="providerNameCB">Provider name</label>
        <input id="providerNameCB" required placeholder="Short name" maxlength="8" bind:value={newProviderName}/>
        <button id="create-provider-btn" on:click|preventDefault={doCreateProvider}>Create Provider</button>
        <button on:click|preventDefault={hideSelf}>Cancel</button>
    </form>
</div>
