<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/mvp.css@1.12/mvp.css">
    <link rel="stylesheet" href="app.css">
</svelte:head>
<script lang=ts>
    import { SvelteComponent } from "svelte";
    import Connect from "../components/Connect.svelte";
    import Capacity from "../components/Capacity.svelte";
    import {storeConnected, storeValidAccounts, transactionSigningAddress} from "$lib/stores";

    let token = '';
    let blockNumber = 0;

    let connected = false;
    let validAccounts = {};

    let signingAddress = "";
    storeConnected.subscribe((val) => connected = val);
    storeValidAccounts.subscribe((val) => {
        console.info("page.svelte storeValidAccounts.subscribe");
        validAccounts = val;
        transactionSigningAddress.update(addr => addr = Object.values(val)[0]?.meta.address);
    });
    transactionSigningAddress.subscribe(addr => signingAddress = addr);

    const onChangeTxnSigningAddress = (evt: Event) => {
        let option = evt.target as HTMLOptionElement;
        transactionSigningAddress.update(addr => addr = option.value);
    }

    let providers = [
        {
            name: 'Rococo',
            url: 'wss://rpc.rococo.frequency.xyz'
        },
        {
            name: 'Localhost',
            url: 'ws://localhost:9944'
        },
        {
            name: 'Other',
            url: 'Other'
        }
    ];
    let selectedProvider: string = providers[0].url;
    let otherProvider: string = '';

</script>
<style>
    #status-bar {
        display: flex;
        font-size: smaller;
    }
    .status-item {
        padding-right: 1.5em;
    }
</style>

<h1>Welcome to Provider Dashboard</h1>
<div id="status-bar">
    <div id="connection-status" class="status-item">
        <h3>Connection status: { connected ? "Connected" : "Not connected" }</h3>
        <p>Token: <span id="unit">{token}</span></p>
        <p>Current block number: <span id="current-block">{blockNumber}</span></p>
    </div>
    <div id="capacity-status" class="status-item">
        <Capacity bind:token={token} />
    </div>
</div>
<form id="setupForm">
    <label for="provider-list">1. Choose an Endpoint</label>
    <select id="provider-list" required
        bind:value={selectedProvider}
    >
        {#each providers as provider}
            <option value={provider.url}>{provider.name}: {provider.url !== "Other" ? provider.url : "Custom websocket"}</option>
        {/each}
    </select>

    <Connect
             bind:blockNumber={blockNumber}
             selectedProvider={selectedProvider}
             otherProvider={otherProvider}
             bind:token={token}
    />
    <fieldset class={connected ? "" : "hidden"}>
        <label for="signing-address" >2. Choose a Transaction Signing Address</label>
        <select id="signing-address" on:change={onChangeTxnSigningAddress}>
            {#each Object.keys(validAccounts) as address}
                <option value={address}>{validAccounts[address].meta.name}: {address}</option>
            {/each}
        </select>
    </fieldset>
</form>
