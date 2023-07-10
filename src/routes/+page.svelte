<svelte:head>
    <link rel="stylesheet" href="//unpkg.com/mvp.css@1.12/mvp.css">
    <link rel="stylesheet" href="/app.css">
</svelte:head>
<script>
    import Hello from "../components/Hello.svelte";
    let connected = false;
    let token = '';
    let blockNumber = 0;

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
    <select id="provider-list" required>
        <option value="wss://0.rpc.frequency.xyz">Mainnet 0</option>
        <option value="wss://1.rpc.frequency.xyz">Mainnet 1</option>
        <option value="wss://rpc.rococo.frequency.xyz" name="rococo">Rococo</option>
        <option value="ws://localhost:9944" name="localhost">Localhost</option>
        <option>other</option>
    </select>

    <label for="signing-address">2. Choose a Transaction Signing Address</label>
    <select id="signing-address" required></select>

    <button type="button" id="connectButton" disabled>3. Connect to Node</button>
</form>

<Hello count=10/>