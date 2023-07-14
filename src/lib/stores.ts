import {writable} from "svelte/store";
import { defaultDotApi } from "$lib/storeTypes";

export const storeConnected = writable(false);
export const storeValidAccounts = writable({});
export const transactionSigningAddress = writable("");
export const dotApi = writable(defaultDotApi);