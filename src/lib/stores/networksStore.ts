import { writable } from 'svelte/store';

/**
 * Represents information about a network.
 */
export interface NetworkInfo {
  name?: string;
  endpoint?: URL;
  genesisHash?: string;
}

export const allNetworks = writable<NetworkInfo[]>([
  {
    name: 'MAINNET',
    endpoint: new URL('wss://0.rpc.frequency.xyz'),
    genesisHash: '0x4a587bf17a404e3572747add7aab7bbe56e805a5479c6c436f07f36fcc8d3ae1',
  },
  {
    name: 'TESTNET',
    endpoint: new URL('wss://rpc.rococo.frequency.xyz'),
    genesisHash: '0x0c33dfffa907de5683ae21cc6b4af899b5c4de83f3794ed75b2dc74e1b088e72',
  },
  { name: 'LOCALHOST', endpoint: new URL('ws://127.0.0.1:9944'), genesisHash: undefined },
  { name: 'CUSTOM', endpoint: new URL('ws://127.0.0.1:9944'), genesisHash: undefined },
]);

/**
 * The selected network.
 */
export const selectedNetwork = writable<NetworkInfo | null>(null);

