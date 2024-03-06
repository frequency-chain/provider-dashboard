import type { ApiPromise, WsProvider } from '@polkadot/api';
import type { Keyring } from '@polkadot/api';

export type DotApi = {
  api?: ApiPromise;
  wsProvider?: WsProvider;
  keyring?: Keyring;
  options?: any;
  selectedEndpoint?: string;
};

export const defaultDotApi: DotApi = {
  selectedEndpoint: '',
  options: {},
};

export type MsaInfo = {
  isProvider: boolean;
  msaId: number;
  providerName: string;
};

export type ChainInfo = {
  blockNumber: bigint;
  epochNumber: bigint;
  connected: boolean;
  token: string;
};
