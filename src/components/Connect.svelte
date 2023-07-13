<script lang=ts>
	import { onMount } from 'svelte';
	import {storeConnected, storeValidAccounts} from "$lib/stores";

	// @ts-ignore
	let ApiPromise, WsProvider, options, web3Enable, web3Accounts, Keyring;
	onMount(async() => {
		// @ts-ignore
		let dotapi = await import('https://cdn.jsdelivr.net/npm/@polkadot/api@10.5.1/+esm');
		ApiPromise = dotapi.ApiPromise;
		WsProvider = dotapi.WsProvider;
		// @ts-ignore
		let polkadotExt = await import('https://cdn.jsdelivr.net/npm/@polkadot/extension-dapp@0.46.2/+esm');
		web3Enable = polkadotExt.web3Enable;
		web3Accounts = polkadotExt.web3Accounts;
		// @ts-ignore
		let keyringApi = await import('https://cdn.jsdelivr.net/npm/@polkadot/keyring@12.1.2/+esm');
		Keyring = keyringApi.Keyring;
		// @ts-ignore
	    let dotFreq = await import('https://cdn.jsdelivr.net/npm/@frequency-chain/api-augment@1.6.1/+esm');
		options = dotFreq.options;
	})

	export let selectedProvider: string;
	export let otherProvider: string;
	// export let connected: boolean;
	export let blockNumber: number;
	export let token;

	// Add Reactive statement to enable/disable the connect button when the selectedProvider changes.
	export let canConnect = false;
	$: canConnect = selectedProvider !== "" || otherProvider !== "";

	const GENESIS_HASHES: Record<string, string> = {
		"wss://rpc.rococo.frequency.xyz": "0x0c33dfffa907de5683ae21cc6b4af899b5c4de83f3794ed75b2dc74e1b088e72",
		frequency: "0x4a587bf17a404e3572747add7aab7bbe56e805a5479c6c436f07f36fcc8d3ae1",
	}

	// let PREFIX = 42;
	let api;
	let singletonApi;
	let singletonProvider;

	async function getBlockNumber(api: ApiPromise): Promise<number> {
		let blockData = await api.rpc.chain.getBlock();
		return blockData.block.header.number.toNumber()
	}

	async function loadAccounts() {
		// populating for localhost and for a parachain are different since with localhost, there is
		// access to the Alice/Bob/Charlie accounts etc., and so won't use the extension.
		let localAccounts = {};
		if (selectedProvider === "ws://localhost:9944") {
			const keyring = new Keyring({ type: 'sr25519' });

			['//Alice', '//Bob', '//Charlie', '//Dave', '//Eve', '//Ferdie'].forEach(accountName => {
				let account = keyring.addFromUri(accountName);
				account.meta.name = accountName;
				localAccounts[account.address] = account;
			})
		} else {
			const extensions = await web3Enable('Frequency parachain signer helper');
			if (!extensions.length) {
				alert("Polkadot{.js} extension not found; please install it first.");
				return;
			}
			let allAccounts = await web3Accounts();
			allAccounts.forEach(a => {
				// display only the accounts allowed for this chain
				if (!a.meta.genesisHash
					|| GENESIS_HASHES[selectedProvider] === a.meta.genesisHash) {
					localAccounts[a.address] = a;
				}
			});
		}
		storeValidAccounts.update((val) => val = localAccounts);
	}

	function getToken(chain) {
		let rawUnit = chain.tokenSymbol.toString();
		return rawUnit.slice(1,rawUnit.length-1);
	}

	async function updateConnectionStatus(api) {
		const chain = await api.rpc.system.properties();
		// PREFIX = Number(chain.ss58Format.toString());
		token = getToken(chain);
		blockNumber = await getBlockNumber(singletonApi);
		storeConnected.update((val) => val = api.isConnected);
	}

	async function getApi(providerUri: string) {
		if (!providerUri) {
			throw new Error("Empty providerURI");
		}
		// Handle disconnects
		if (providerUri) {
			if (singletonApi) {
				await singletonApi.disconnect();
			} else if (singletonProvider) {
				await singletonProvider.disconnect();
			}
		}

		// Singleton Provider because it starts trying to connect here.
		singletonProvider = new WsProvider(providerUri);
		singletonApi = await ApiPromise.create({
			provider: singletonProvider,
			...options,
		});

		await singletonApi.isReady;
		return singletonApi;
	}


	async function connect() {
		// Exception for the "other" endpoint
		try {
			api = await getApi(selectedProvider);
			await loadAccounts();
			await updateConnectionStatus(api);
		} catch (e: any){
			console.error("Error: ", e);
			alert(`could not connect to ${selectedProvider || "empty value"}. Please enter a valid and reachable Websocket URL.`);
		} finally {
			// Disable connect button
			canConnect = false;
		}
		return;
	}
</script>
<input
	type="text"
	id="other-endpoint-url"
	placeholder="wss://some.frequency.node"
	bind:value={otherProvider}
	disabled={selectedProvider.toString() != 'Other'}
/>
<button
	on:click|preventDefault={async () => await connect()}
	id="connect-button"
	disabled={!canConnect}
>
	Connect to this Endpoint
</button>

