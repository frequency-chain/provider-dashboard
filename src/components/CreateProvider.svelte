<script lang="ts">
    import {dotApi, storeCurrentAction, transactionSigningAddress} from "$lib/stores";
    import type {DotApi} from '$lib/storeTypes';
    import {ActionForms, defaultDotApi} from "$lib/storeTypes";
    import type {ApiPromise} from "@polkadot/api";
    import {isLocalhost} from "$lib/utils";
    import {submitCreateProvider} from "$lib/connections";
    import TransactionStatus from "$components/TransactionStatus.svelte";
    import {isFunction} from "@polkadot/util";
    import {onMount} from "svelte";

    let me = ActionForms.CreateProvider;
    let newProviderName = '';
    let localDotApi: DotApi = defaultDotApi;
    let web3FromSource;
    let web3Enable;
    let showTransactionStatus = false;
    export let txnStatuses: Array<string> = [];
    export let validAccounts = {}
    let currentAction: ActionForms;
    export let signingAddress = '';

    onMount(async () => {
        const extension = await import('@polkadot/extension-dapp');
        web3FromSource = extension.web3FromSource;
        web3Enable = extension.web3Enable;
    });

    let localSigningAddress = '0xabcdefbeef';
    transactionSigningAddress.subscribe(addr => localSigningAddress = addr)
    dotApi.subscribe((api: DotApi) => localDotApi = dotApi)
    storeCurrentAction.subscribe(action => {
        currentAction = action
    });

    const hideSelf = () => {
        storeCurrentAction.set(ActionForms.NoForm);
    }

    const doCreateProvider = async (_evt: Event) => {
        if (newProviderName === '') {
            alert("please enter a Provider Name");
            return;
        }
        if (!localDotApi) {
            alert('please reconnect to an endpoint');
            return;
        }
        clearTxnStatuses();
        let endpointURI: string = localDotApi.selectedEndpoint || '';
        if (isFunction(web3FromSource) && isFunction(web3Enable)) {
            let signingKeys = validAccounts[signingAddress];
            showTransactionStatus = true;
            if (isLocalhost(endpointURI)) {
                await submitCreateProvider(
                    localDotApi.api as ApiPromise,
                    undefined,
                    endpointURI,
                    signingKeys,
                    newProviderName,
                    addNewTxnStatus);
            } else {
                const extensions = web3Enable('Frequency parachain provider dashboard: Creating provider');
                if (extensions.length !== 0) {
                    const injectedExtension = await web3FromSource(signingKeys.meta.source);
                    await submitCreateProvider(
                        localDotApi as ApiPromise,
                        injectedExtension,
                        endpointURI,
                        signingKeys,
                        newProviderName,
                        addNewTxnStatus
                    );
                }
            }
        }
    }

    const addNewTxnStatus = (txnStatus: string) => {
        txnStatuses = [...txnStatuses, txnStatus];
    };
    const clearTxnStatuses = () => (txnStatuses = new Array<string>());

</script>
<div id='create-provider' class:hidden={currentAction !== me}>
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
    <TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses}/>
</div>
