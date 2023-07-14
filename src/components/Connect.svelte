<script lang=ts>
	import { onMount } from 'svelte';
	import {storeConnected, storeValidAccounts, dotApi, transactionSigningAddress} from "$lib/stores";
	import type {DotApi} from "$lib/storeTypes";
	import { options } from "@frequency-chain/api-augment";
	import {ApiPromise, WsProvider} from "@polkadot/api";
	import { Keyring } from "@polkadot/api";

	// let options = frequency.options;

	// @ts-ignore
	let apiPromise: ApiPromise;
	let wsProvider: WsProvider;
	let web3Enable: (originName: string, compatInits?: (() => Promise<boolean>)[]) => Promise<Array<any>> = (): any => {};
	let web3Accounts = (): any => {};

	onMount(async() => {
		// This must be in onMount because the extension requires that you have a window to attach to.
		// Since this project is precompiled, there will be no window until onMount
		let polkadotExt = await import("@polkadot/extension-dapp");
		web3Enable = polkadotExt.web3Enable;
		web3Accounts = polkadotExt.web3Accounts;
	});

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

	async function getBlockNumber(): Promise<number> {
		let blockData = await apiPromise.rpc.chain.getBlock();
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
		// to avoid updating subscribers with an empty list
		if (Object.keys(localAccounts).length > 0) {
			storeValidAccounts.update((val) => val = localAccounts);
		}
		return localAccounts;
	}

	function getToken(chain) {
		let rawUnit = chain.tokenSymbol.toString();
		return rawUnit.slice(1,rawUnit.length-1);
	}

	async function updateConnectionStatus() {
		const chain = await apiPromise.rpc.system.properties();
		token = getToken(chain);
		blockNumber = await getBlockNumber();
		storeConnected.update((val) => val = apiPromise.isConnected);
	}

	async function getApi(providerUri: string) {
		if (!providerUri) {
			throw new Error("Empty providerURI");
		}
		// Handle disconnects
		if (providerUri) {
			if (apiPromise) {
				console.info("disconnecting api first.")
				await apiPromise.disconnect();
			} else if (wsProvider) {
				console.info("disconnecting provider first.")
				await wsProvider.disconnect();
			}
		}

		// Singleton Provider because it starts trying to connect here.

		wsProvider = new WsProvider(providerUri);
		apiPromise = await ApiPromise.create({
			provider: wsProvider,
			...options,
		});

		await apiPromise?.isReady;
		let initializedDotApi: DotApi = {
			wsProvider: wsProvider,
			api: apiPromise,
			keyring: Keyring,
			options
		};
		dotApi.update(currentApi => currentApi = initializedDotApi);
	}


	async function connect() {
		// Exception for the "other" endpoint
		try {
			await getApi(selectedProvider);
			let accounts = await loadAccounts();
			await updateConnectionStatus();
			let firstAccount = Object.values(accounts)[0];
			transactionSigningAddress.update((val) => val = firstAccount)
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

