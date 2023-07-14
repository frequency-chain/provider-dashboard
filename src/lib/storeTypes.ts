// @ts-ignore
import {ApiPromise, WsProvider} from "@polkadot/api";
// @ts-ignore
import {Keyring} from "@polkadot/api";

export type DotApi = {
    api?: ApiPromise,
    wsProvider?: WsProvider,
    keyring?: Keyring,
    options?: any,
}

export const defaultDotApi: DotApi = {}