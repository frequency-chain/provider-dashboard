import type { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import type { ApiOptions } from '@polkadot/api/types';

export interface DotApi {
  api?: ApiPromise;
  wsProvider?: WsProvider;
  keyring?: Keyring;
  options?: ApiOptions;
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

export type OnChangeFn<T> = (value: T | undefined) => void;