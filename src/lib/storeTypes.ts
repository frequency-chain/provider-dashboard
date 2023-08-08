// @ts-ignore
import { ApiPromise, WsProvider } from '@polkadot/api';
// @ts-ignore
import { Keyring } from '@polkadot/api';

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
/* eslint-disable no-unused-vars */
export enum ActionForms {
  NoForm,
  AddControlKey,
  Stake,
  CreateProvider,
  RequestToBeProvider,
}

export type MsaInfo = {
  isProvider: boolean;
  msaId: number;
  providerName: string;
}