import { writable } from 'svelte/store';
import { ActionForms, defaultDotApi, defaultMsaInfo } from '$lib/storeTypes';

export const storeConnected = writable(false);
export const storeValidAccounts = writable({});
export const transactionSigningAddress = writable('');

export const storeMsaInfo = writable()
export const dotApi = writable(defaultDotApi);

export const storeBlockNumber = writable(0n);

export const storeCurrentAction = writable(ActionForms.NoForm);

export const storeToken = writable('');
