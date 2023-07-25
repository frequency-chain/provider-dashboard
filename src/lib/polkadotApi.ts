// @ts-ignore
// import {onMount} from "svelte";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { getBlockNumber } from "./connections";
import { Keyring } from "@polkadot/api";
import { GENESIS_HASHES } from "./connections";
import {
    storeBlockNumber,
    storeValidAccounts,
    storeConnected,
    storeToken,
    dotApi
} from "./stores";
import { options } from "@frequency-chain/api-augment";
// import { apiPromise, wsProvider, web3Enable, web3Accounts } from "$components/Connect.svelte";
// @ts-ignore
// import { SignerResult } from "@polkadot/types";
import {isLocalhost, waitFor} from "$lib/utils";

import type { DotApi } from "$lib/storeTypes";
import type {KeyringPair} from "@polkadot/keyring/types";
import type {InjectedAccountWithMeta, InjectedExtension} from "@polkadot/extension-inject/types";
import {isFunction, u8aToHex, u8aWrapBytes} from "@polkadot/util";
import type {SignerPayloadRaw, SignerResult} from "@polkadot/types/types";
import type {SubmittableExtrinsic} from "@polkadot/api/promise/types";
import type {EventRecord, ExtrinsicStatus, Key} from "@polkadot/types/interfaces";

type AccountMap = {
    [key: string]: KeyringPair;
}

// REVIEW: Do we need to subscribe to the apiPromise or can we just update it here?
// dotApi.subscribe(api => thisDotApi = api);

// @ts-ignore
// export let apiPromise: ApiPromise;
// export let wsProvider: WsProvider;
// export let web3Enable: (originName: string, compatInits?: (() => Promise<boolean>)[]) => Promise<Array<any>> = (): any => {};
// export let web3Accounts = (): any => {};

// No functions in here should have to talk to a component

export async function getApi(
    selectedProviderURI: string,
    selectedProvider: string,
    thisDotApi,
    wsProvider,
    web3Enable
) {

    if (!selectedProviderURI) {
        throw new Error("Empty providerURI");
    }
    // Handle disconnects
    if (selectedProviderURI) {
        if (thisDotApi?.api) {
            await thisDotApi.api.disconnect();
        } else if (wsProvider) {
            await wsProvider.disconnect();
        }
    }

    // Singleton Provider because it starts trying to connect here.
    // Check that the polkadot extension is installed if connecting to Rococo
    if (selectedProvider === "Rococo") {
        const extensions = await web3Enable('Frequency parachain provider dashboard');
        if (!extensions || !extensions.length) {
            alert("Polkadot{.js} extension not found; please install it first.");
            throw new Error("Polkadot{.js} extension not found; please install it first.");
        }
    }

    wsProvider = new WsProvider(selectedProviderURI);
    const apiPromise = await ApiPromise.create({
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

export async function loadAccounts(selectedProvider: string, web3Accounts) {
    // populating for localhost and for a parachain are different since with localhost, there is
    // access to the Alice/Bob/Charlie accounts etc., and so won't use the extension.
    let foundAccounts: AccountMap = {};
    if (selectedProvider === "Localhost") {
        const keyring = new Keyring({ type: 'sr25519' });

        ['//Alice', '//Bob', '//Charlie', '//Dave', '//Eve', '//Ferdie'].forEach(accountName => {
            let account = keyring.addFromUri(accountName);
            account.meta.name = accountName;
            foundAccounts[account.address] = account;
        })
    } else {
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

export function getToken(chain) {
    let rawUnit = chain.tokenSymbol.toString();
    return rawUnit.slice(1, rawUnit.length - 1);
}

export async function updateConnectionStatus(apiPromise: ApiPromise) {
    const chain = await apiPromise.rpc.system.properties();
    const token = getToken(chain);
    const blockNumber = await getBlockNumber(apiPromise);
    storeConnected.update((val) => val = apiPromise.isConnected);
    storeToken.update(val => val = token)
    storeBlockNumber.update(val => val = blockNumber);
}
