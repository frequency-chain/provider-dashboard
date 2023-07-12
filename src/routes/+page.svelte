<svelte:head>
    <link rel="stylesheet" href="//unpkg.com/mvp.css@1.12/mvp.css">
    <link rel="stylesheet" href="/app.css">
</svelte:head>
<script lang=ts>
    import { SvelteComponent } from "svelte";
    import Connect from "../components/Connect.svelte";

    let connected = false;
    let token = '';
    let blockNumber = 0;

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
            name: 'other',
            url: 'wss://some.node'
        }
    ];  
    let selectedProvider: string = providers[0].url;
    let otherProvider: string = '';
    let validAccounts = {};
    let canConnect = false;
</script>

<h1>Welcome to Provider Dashboard</h1>
<div id="connection-status">
    <h3>Connection status: { connected ? "Connected" : "Not connected" }</h3>
    <p>Token: <span id="unit">{token}</span></p>
    <p>Current block number: <span id="current-block">{blockNumber}</span></p>
    <p>For itemized schema on Rococo, use Schema ID = 56</p>
    <p>For paginated schema on Rococo, use Schema ID = 57</p>
</div>
<form id="setupForm">
    <label for="provider-list">1. Choose an Endpoint</label>
    <select id="provider-list" required
        bind:value={selectedProvider}
    >
        {#each providers as provider}
            <option value={provider.url}>{provider.name}</option>
        {/each}
    </select>

    <Connect bind:connected={connected}
             bind:blockNumber={blockNumber}
             bind:validAccounts={validAccounts}
             selectedProvider={selectedProvider}
             otherProvider={otherProvider}
    />
    <label for="signing-address">2. Choose a Transaction Signing Address</label>
    <select id="signing-address" required>
        {#each Object.keys(validAccounts) as address}
            <option value={address}>{validAccounts[address].meta.name}: {address}</option>
        {/each}
    </select>
</form>
