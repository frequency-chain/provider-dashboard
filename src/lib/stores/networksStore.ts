import { writable, type Writable } from 'svelte/store';

/**
 * Represents the available networks.
 */
export enum Network {
    NONE = 'NONE',
    TESTNET= 'TESTNET',
    MAINNET = 'MAINNET',
    LOCALHOST = 'LOCALHOST',
    CUSTOM = 'CUSTOM',
};

/**
 * Represents information about a network.
 */
export interface NetworkInfo {
    name: string | undefined;
    endpoint: URL | undefined;
    genesisHash: string | undefined;
}

/**
 * Mapping of network types to network information.
 */
export const networkToInfo: Record<Network, NetworkInfo> = {
    NONE: { name: undefined, endpoint: undefined, genesisHash: undefined },
    TESTNET: { name: 'TESTNET', endpoint: new URL('wss://rpc.rococo.frequency.xyz'), genesisHash: '0x0c33dfffa907de5683ae21cc6b4af899b5c4de83f3794ed75b2dc74e1b088e72'},
    MAINNET: { name: 'MAINNET', endpoint: new URL('wss://0.rpc.frequency.xyz'), genesisHash: '0x4a587bf17a404e3572747add7aab7bbe56e805a5479c6c436f07f36fcc8d3ae1'},
    LOCALHOST: { name: 'LOCALHOST', endpoint: new URL('ws://127.0.0.1:9944'), genesisHash: undefined},
    CUSTOM: { name: 'CUSTOM', endpoint: new URL('ws://127.0.0.1:9944'), genesisHash: undefined },
};

/**
 * The selected network.
 */
export const selectedNetwork = writable(Network.NONE);

export function allNetworks(): Record<string, string> {
    return Object.entries(networkToInfo).reduce((acc: Record<string, string>, [key, value]) => {
        if (key !== Network.NONE) {
            acc[key] = `${value.name}: ${value.endpoint?.toString().replace(/\/$/, '')}`;
        }
        return acc;
      }, {});
}
