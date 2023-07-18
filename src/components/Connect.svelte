<script lang=ts>
	import { onMount } from 'svelte';
	import {storeBlockNumber, storeConnected, storeValidAccounts, dotApi, storeProviderId, transactionSigningAddress} from "$lib/stores";
	import type {DotApi} from "$lib/storeTypes";
	import { options } from "@frequency-chain/api-augment";
	import {ApiPromise, WsProvider} from "@polkadot/api";
	import { Keyring } from "@polkadot/api";
	import {providers, getBlockNumber} from "$lib/connections";

	// @ts-ignore
	let apiPromise: ApiPromise;
	let wsProvider: WsProvider;
	let web3Enable: (originName: string, compatInits?: (() => Promise<boolean>)[]) => Promise<Array<any>> = (): any => {};
	let web3Accounts = (): any => {};

	onMount(async() => {
		// This must be in onMount because the extension requires that you have a window to attach to.
		// Since this project is precompiled, there will be no window until onMount
		const polkadotExt = await import("@polkadot/extension-dapp");
		web3Enable = polkadotExt.web3Enable;
		web3Accounts = polkadotExt.web3Accounts;
	});

	let selectedProvider: string = "Rococo";
	let otherProvider: string;
	let blockNumber: number;
	export let token;

	// Add Reactive statement to enable/disable the connect button when the selectedProvider changes.
	export let canConnect = false;
	$: canConnect = selectedProvider !== "" || otherProvider !== "";

	const GENESIS_HASHES: Record<string, string> = {
		Rococo: "0x0c33dfffa907de5683ae21cc6b4af899b5c4de83f3794ed75b2dc74e1b088e72",
		frequency: "0x4a587bf17a404e3572747add7aab7bbe56e805a5479c6c436f07f36fcc8d3ae1",
	}

	async function loadAccounts() {
		// populating for localhost and for a parachain are different since with localhost, there is
		// access to the Alice/Bob/Charlie accounts etc., and so won't use the extension.
		let foundAccounts = {};
		if (selectedProvider === "Localhost") {
			const keyring = new Keyring({ type: 'sr25519' });

			['//Alice', '//Bob', '//Charlie', '//Dave', '//Eve', '//Ferdie'].forEach(accountName => {
				let account = keyring.addFromUri(accountName);
				account.meta.name = accountName;
				foundAccounts[account.address] = account;
			})
		} else {
			const extensions = await web3Enable('Frequency parachain provider dashboard');
			if (!extensions || !extensions.length) {
				alert("Polkadot{.js} extension not found; please install it first.");
				return;
			}
			let allAccounts = await web3Accounts();
			allAccounts.forEach(a => {
				// display only the accounts allowed for this chain
				if (!a.meta.genesisHash
					|| GENESIS_HASHES[selectedProvider] === a.meta.genesisHash) {
					foundAccounts[a.address] = a;
				}
			});
		}
		// to avoid updating subscribers with an empty list
		if (Object.keys(foundAccounts).length > 0) {
			storeValidAccounts.update((val) => val = foundAccounts);
		}
	}

	function getToken(chain) {
		let rawUnit = chain.tokenSymbol.toString();
		return rawUnit.slice(1,rawUnit.length-1);
	}

	async function updateConnectionStatus() {
		const chain = await apiPromise.rpc.system.properties();
		token = getToken(chain);
		blockNumber = await getBlockNumber(apiPromise);
		storeBlockNumber.update(val => val = blockNumber);
		storeConnected.update((val) => val = apiPromise.isConnected);
	}

	async function getApi(selectedProvider: string) {
		let selectedProviderURI = providers[selectedProvider]

		if (!selectedProviderURI) {
			throw new Error("Empty providerURI");
		}
		// Handle disconnects
		if (selectedProviderURI) {
			if (apiPromise) {
				await apiPromise.disconnect();
			} else if (wsProvider) {
				await wsProvider.disconnect();
			}
		}

		// Singleton Provider because it starts trying to connect here.

		wsProvider = new WsProvider(selectedProviderURI);
		apiPromise = await ApiPromise.create({
			provider: wsProvider,
			...options,
		});

		await apiPromise?.isReady;
		let initializedDotApi: DotApi = {
			wsProvider: wsProvider,
			api: apiPromise,
			keyring: Keyring,
			selectedEndpoint: selectedProviderURI,
			options
		};
		dotApi.update(currentApi => currentApi = initializedDotApi);
	}


	async function connect() {
		// TODO: do we need to do this or just properly listen in each component?
		storeConnected.update(val => val = false);
		storeValidAccounts.update(val => val = {});
		transactionSigningAddress.update(val => val = "");
		let selectedProviderURI: string = "";
		if (selectedProvider === 'Other') {
			selectedProviderURI = otherProvider;
		} else {
			selectedProviderURI = providers[selectedProvider];
		}

		try {
			await getApi(selectedProvider);
			await getApi(selectedProviderURI);
			await loadAccounts();
			await updateConnectionStatus();
		} catch (e: any){
			console.error("Error: ", e);
			alert(`could not connect to ${selectedProviderURI || "empty value"}. Please enter a valid and reachable Websocket URL.`);
		} finally {
			// Disable connect button
			canConnect = false;
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

