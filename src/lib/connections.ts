// @ts-ignore
import {ApiPromise} from "@polkadot/api/promise";

export let providers = {
    Rococo: 'wss://rpc.rococo.frequency.xyz',
    Localhost: 'ws://localhost:9944',
    Other: 'wss://some.node',
}

export async function getBlockNumber(api: ApiPromise): Promise<BigInt> {
    if (api && await api.isReady) {
        let blockData = await api.rpc.chain.getBlock();
        return blockData.block.header.number.toBigInt()
    }
    return 0n;
}

export async function getEpoch(api: ApiPromise): Promise<BigInt> {
    if (api && await api.isReady) {
        return (await api.query.capacity.currentEpoch()).toBigInt();
    }
    return 0n;
}