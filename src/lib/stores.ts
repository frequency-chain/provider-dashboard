import { writable } from 'svelte/store';
import { defaultDotApi } from '$lib/storeTypes';

export const dotApi = writable(defaultDotApi);

export const storeChainInfo = writable({ connected: false, blockNumber: 0n, epochNumber: 0n, token: '' });

export const isLoggedIn = writable(false);
