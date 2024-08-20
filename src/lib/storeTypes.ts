import type { ApiPromise, WsProvider } from '@polkadot/api';
import type { Keyring } from '@polkadot/api';

export interface DotApi {
  api?: ApiPromise;
  wsProvider?: WsProvider;
  keyring?: Keyring;
  options?: any;
  selectedEndpoint?: string;
}

export const defaultDotApi: DotApi = {
  selectedEndpoint: '',
  options: {},
};

export interface MsaInfo {
  isProvider: boolean;
  msaId: number;
  providerName: string;
}

export interface ChainInfo {
  blockNumber: bigint;
  epochNumber: bigint;
  connected: boolean;
  token: string;
}

export enum TxnStatus {
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export interface Activity {
  txnId: string;
  txnStatusItems: string[];
  txnStatus: TxnStatus;
}
