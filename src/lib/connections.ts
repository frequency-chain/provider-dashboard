// @ts-ignore
import {ApiPromise} from "@polkadot/api/promise";
// @ts-ignore
// import { SignerResult } from "@polkadot/types";
import {isLocalhost, waitFor} from "$lib/utils";

import type {KeyringPair} from "@polkadot/keyring/types";
import type {InjectedAccountWithMeta, InjectedExtension} from "@polkadot/extension-inject/types";
import {isFunction, u8aToHex, u8aWrapBytes} from "@polkadot/util";
import type {SignerPayloadRaw, SignerResult} from "@polkadot/types/types";
import type {SubmittableExtrinsic} from "@polkadot/api/promise/types";
import type {EventRecord, ExtrinsicStatus} from "@polkadot/types/interfaces";

export let providers = {
    Rococo: 'wss://rpc.rococo.frequency.xyz',
    Localhost: 'ws://localhost:9944',
    Other: 'wss://some.node',
}

type AddKeyData = { msaId: string; expiration: string; newPublicKey: string; }
type SigningKey = InjectedAccountWithMeta | KeyringPair

// No functions in here should have to talk to a component
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

// TODO: will need to handle "other" URLs and pass the URL instead.
export async function submitAddControlKey(api: ApiPromise,
                                          extension: InjectedExtension | undefined,
                                          newAccount: SigningKey,
                                          signingAccount: SigningKey,
                                          providerId: number,
                                          endpointURL: string,
                                          callback: () => void) {
    const blockNumber = await getBlockNumber(api) as bigint
    if (api && await api.isReady) {
        const rawPayload: AddKeyData = {
            msaId: providerId.toString(),
            expiration: (blockNumber + 100n).toString(),
            newPublicKey: newAccount.address,
        }

        const newKeyPayload = api.registry.createType("PalletMsaAddKeyData", rawPayload);
        const useKeyring: boolean = isLocalhost(endpointURL);

        const ownerKeySignature = useKeyring ?
            signPayloadWithKeyring(signingAccount as KeyringPair, newKeyPayload) :
            await signPayloadWithExtension(extension as InjectedExtension, signingAccount as InjectedAccountWithMeta, newKeyPayload);

        const newKeySignature = useKeyring ?
            signPayloadWithKeyring(newAccount as KeyringPair, newKeyPayload) :
            await signPayloadWithExtension(extension as InjectedExtension, newAccount as InjectedAccountWithMeta, newKeyPayload);

        const ownerKeyProof = { Sr25519: ownerKeySignature };
        const newKeyProof = { Sr25519: newKeySignature };
        const extrinsic = api.tx.msa.addPublicKeyToMsa(signingAccount.address, ownerKeyProof, newKeyProof, newKeyPayload);
       useKeyring ?
            await submitExtrinsicWithKeyring(extrinsic, signingAccount as KeyringPair, callback):
            await submitExtrinsicWithExtension(extension as InjectedExtension, extrinsic, signingAccount as InjectedAccountWithMeta, callback);

    } else {
        console.debug("didn't make it");
    }
}



function showExtrinsicStatus(txnStatus: string) {
    console.log("Transaction status: ", txnStatus)
}

export async function parseChainEvent ({ events = [], status }: { events?: EventRecord[], status: ExtrinsicStatus; }): Promise<void> {
    if (status.isInvalid) {
        showExtrinsicStatus("Invalid transaction");
        return;
    } else if ( status.isFinalized ) {
        showExtrinsicStatus(`Transaction is finalized in blockhash ${status.asFinalized.toHex()}`);
        events.forEach(
            ({event}) => {
                if (event.method === 'ExtrinsicSuccess') {
                    showExtrinsicStatus('Transaction succeeded');
                } else if (event.method === 'ExtrinsicFailed') {
                    showExtrinsicStatus('Transaction failed. See chain explorer for details.');
                }
            }
        );
        return;
    } else if (status.isInBlock) {
        showExtrinsicStatus(`Transaction is included in blockHash ${status.asInBlock.toHex()}`);
    } else {
        if (!!status?.status) {
            showExtrinsicStatus(status.toHuman())
        }
    }
}

async function submitExtrinsicWithExtension(extension: InjectedExtension,
                                            extrinsic: SubmittableExtrinsic,
                                            signingAccount: InjectedAccountWithMeta,
                                            onTxDone: () => void ): Promise<void> {
    // const injector = await web3FromSource(signingAccount.meta.source);
    let currentTxDone = false;
    try {
        function sendStatusCb({events = [], status}: { events?: EventRecord[], status: ExtrinsicStatus; }) {
            if (status.isInvalid) {
                alert('Transaction is Invalid');
                currentTxDone = true;
            } else if (status.isReady) {
                showExtrinsicStatus("Transaction is Ready");
            } else if (status.isBroadcast) {
                showExtrinsicStatus("Transaction is Broadcast");
            } else if (status.isInBlock) {
                showExtrinsicStatus(`Transaction is included in blockHash ${status.asInBlock.toHex()}`);
            } else if (status.isFinalized) {
                showExtrinsicStatus(`Transaction is finalized in blockhash ${status.asFinalized.toHex()}`);
                events.forEach(
                    ({event}) => {
                        if (event.method === 'ExtrinsicSuccess') {
                            showExtrinsicStatus('Transaction succeeded');
                        } else if (event.method === 'ExtrinsicFailed') {
                            showExtrinsicStatus('Transaction failed. See chain explorer for details.');
                        }
                    }
                );
                currentTxDone = true;
            }
        }

        await extrinsic.signAndSend(signingAccount.address, {signer: extension.signer, nonce: -1}, sendStatusCb);
        await waitFor(() => currentTxDone);
    } catch(e) {
        showExtrinsicStatus((e as Error).message);
        console.info("Timeout reached, transaction was invalid, or transaction was canceled by user. currentTxDone: ", currentTxDone);
    } finally {
        onTxDone();
    }
}

async function submitExtrinsicWithKeyring(
    extrinsic: SubmittableExtrinsic, signingAccount: KeyringPair, onTxDone: () => void): Promise<void> {
    try {
        await extrinsic.signAndSend(signingAccount, {nonce: -1}, parseChainEvent );
    } catch(e: any) {
        alert(`There was a problem:  ${e.toString()}`);
    } finally {
        onTxDone();
    }
}

// converting to Sr25519Signature is very important, otherwise the signature length
// is incorrect - just using signature gives:
// Enum(Sr25519):: Expected input with 64 bytes (512 bits), found 15 bytes
export async function signPayloadWithExtension(injector: InjectedExtension, signingAccount: InjectedAccountWithMeta, payload: any): Promise<string>{
    const signer = injector?.signer;
    const signRaw = signer?.signRaw;
    let signed: SignerResult;
    if (signer && isFunction(signRaw)) {
        // u8aWrapBytes literally puts <Bytes></Bytes> around the payload.
        const payloadWrappedToU8a = u8aWrapBytes(payload.toU8a());
        const signerPayloadRaw: SignerPayloadRaw = {
            address: signingAccount.address, data: u8aToHex(payloadWrappedToU8a), type: 'bytes'
        }
        try {
            signed = await signRaw(signerPayloadRaw)
            return signed?.signature;
        } catch(e: any) {
            alert(`Signing failed: ${e.message}`);
            return "ERROR " + e.message;
        }
    }
    return "Unknown error"
}

// returns a properly formatted signature to submit with an extrinsic
export function signPayloadWithKeyring(signingAccount: KeyringPair, payload: any): string {
    try {
        // u8aWrapBytes literally puts <Bytes></Bytes> around the payload.
        return u8aToHex(signingAccount.sign(u8aWrapBytes(payload.toU8a())));
    } catch (e: any) {
        alert(`Signing failed: ${e.message}`);
        return "ERROR " + e.message
    }
}
