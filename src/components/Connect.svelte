<script lang=ts>
	import { onMount } from 'svelte';
	import {
		storeConnected,
		dotApi,
	} from "$lib/stores";
	import { defaultDotApi } from '$lib/storeTypes';
	import { providers } from "$lib/connections";
	import {
		getApi,
		loadAccounts,
		updateConnectionStatus
	} from "$lib/polkadotApi";

	import type { ApiPromise, WsProvider } from "@polkadot/api";
	import type { web3Enable, web3Accounts } from "@polkadot/extension-dapp";

	let wsProvider: WsProvider;
	let thisWeb3Enable: typeof web3Enable;
	let thisWeb3Accounts: typeof web3Accounts;

    let connected = false;
    let thisDotApi = defaultDotApi;

	onMount(async() => {
		// This must be in onMount because the extension requires that you have a window to attach to.
		// Since this project is precompiled, there will be no window until onMount
		const polkadotExt = await import("@polkadot/extension-dapp");
		thisWeb3Enable = polkadotExt.web3Enable;
		thisWeb3Accounts = polkadotExt.web3Accounts;
	});

	let selectedProvider: string = "Rococo";
	let otherProvider: string;

	// Add Reactive statement to enable/disable the connect button when the selectedProvider changes.
	let canConnect = false;
	$: canConnect = selectedProvider !== "" || otherProvider !== "";

    storeConnected.subscribe(val => connected = val);
    dotApi.subscribe(api => thisDotApi = api);


	async function connect() {
		let selectedProviderURI: string = "";
		if (selectedProvider === 'Other') {
			selectedProviderURI = otherProvider;
		} else {
			selectedProviderURI = providers[selectedProvider];
		}

		try {
			await getApi(
				selectedProviderURI,
				selectedProvider,
				thisDotApi,
				wsProvider,
				thisWeb3Enable,
			);
			await loadAccounts(selectedProvider, thisWeb3Accounts);
			await updateConnectionStatus(thisDotApi.api as ApiPromise);
		} catch (e: any){
			console.error("Error: ", e);
			alert(`could not connect to ${selectedProviderURI || "empty value"}. Please enter a valid and reachable Websocket URL.`);
		} finally {
			if (thisDotApi.api?.isConnected) {
				// Disable connect button
				canConnect = false;
				console.log("Connected to ", selectedProviderURI);
			}
		}
		return;
	}
</script>

<label for="provider-list">1. Select a Provider</label>
<select id="provider-list" required bind:value={selectedProvider} >
	{#each Object.keys(providers) as providerName}
		<option value={providerName}>{providerName}: {providers[providerName]}</option>
	{/each}
</select>

<input
	type="text"
	id="other-endpoint-url"
	placeholder="wss://some.frequency.node"
	bind:value={otherProvider}
	disabled={selectedProvider.toString() != 'Other'}
/>
<p>Selected Provider: {selectedProvider}</p>
<button
	on:click|preventDefault={async () => await connect()}
	id="connect-button"
	disabled={!canConnect}
>
	Connect to {selectedProvider}
</button>

