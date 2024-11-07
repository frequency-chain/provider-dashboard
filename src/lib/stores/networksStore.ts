import { writable } from 'svelte/store';

export enum NetworkType {
  MAINNET,
  TESTNET_PASEO,
  LOCALHOST,
  CUSTOM,
}

/**
 * Represents information about a network.
 */
export interface NetworkInfo {
  id: NetworkType;
  name: string;
  pathName: string;
  endpoint?: string;
  genesisHash?: string;
}

export const defaultNetworks: NetworkInfo[] = [
  {
    id: NetworkType.MAINNET,
    name: 'Mainnet',
    pathName: 'mainnet',
    endpoint: 'wss://1.rpc.frequency.xyz',
    genesisHash: '0x4a587bf17a404e3572747add7aab7bbe56e805a5479c6c436f07f36fcc8d3ae1',
  },
  {
    id: NetworkType.TESTNET_PASEO,
    name: 'Testnet on Paseo',
    pathName: 'testnet',
    endpoint: 'wss://0.rpc.testnet.amplica.io',
    genesisHash: '0x203c6838fc78ea3660a2f298a58d859519c72a5efdc0f194abd6f0d5ce1838e0',
  },
  { id: NetworkType.LOCALHOST, name: 'Localhost', pathName: 'localhost', endpoint: 'ws://127.0.0.1:9944' },
];

export const allNetworks =
  writable<NetworkInfo[]>(defaultNetworks.concat( [{ id: NetworkType.CUSTOM, name: 'Custom', pathName: 'custom' }]));

export const networkNameToNetworkInfo = (name: string|undefined): NetworkInfo|undefined => {
  if (name ===undefined) return undefined;
  const found = defaultNetworks.find( nw => {
    return nw.pathName.toLowerCase() === name.toLowerCase();
  })
  if (!found) throw(`Network not found: ${name}`);
  return found
}
