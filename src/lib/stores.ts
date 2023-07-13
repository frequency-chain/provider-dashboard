import {writable} from "svelte/store";

export const storeConnected = writable(false);
export const storeValidAccounts = writable({});
export const transactionSigningAddress = writable("");
