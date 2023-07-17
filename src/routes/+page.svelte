<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/mvp.css@1.12/mvp.css">
    <link rel="stylesheet" href="app.css">
</svelte:head>
<script lang=ts>
    import { SvelteComponent } from "svelte";
    import Connect from "../components/Connect.svelte";
    import Capacity from "../components/Capacity.svelte";
    import {storeBlockNumber, storeConnected, storeValidAccounts, transactionSigningAddress} from "$lib/stores";
    import Provider from "../components/Provider.svelte";

    let token = '';
    let blockNumber = 0;
    storeBlockNumber.subscribe(val => blockNumber = val);

    let connected = false;
    let validAccounts = {};

    let signingAddress = "";
    storeConnected.subscribe((val) => connected = val);
    storeValidAccounts.subscribe((val) => {
        validAccounts = val;
    });
    transactionSigningAddress.subscribe(addr => signingAddress = addr);

    const onChangeTxnSigningAddress = (evt: Event) => {
        let option = evt.target as HTMLOptionElement;
        transactionSigningAddress.update(addr => addr = option.value);
    }
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
    <div id="provider-status" class="status-item">
        <Provider />
    </div>
</div>
<form id="setupForm">
    <Connect bind:token/>
    <fieldset class={connected ? "" : "hidden"}>
        <label for="signing-address" >2. Choose a Transaction Signing Address</label>
        <select id="signing-address" on:change={onChangeTxnSigningAddress}>
            {#each Object.keys(validAccounts) as address}
                <option value={address}>{validAccounts[address].meta.name}: {address}</option>
            {/each}
        </select>
    </fieldset>
</form>
