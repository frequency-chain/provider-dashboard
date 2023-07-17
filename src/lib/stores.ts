import {writable} from "svelte/store";
import { defaultDotApi } from "$lib/storeTypes";

export const storeConnected = writable(false);
export const storeValidAccounts = writable({});
export const transactionSigningAddress = writable("");

export const providerId = writable(0);
export const dotApi = writable(defaultDotApi);

export const storeBlockNumber = writable(0n);