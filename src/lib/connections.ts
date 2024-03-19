import type { ApiPromise } from '@polkadot/api/promise';
// @ts-ignore
// import { SignerResult } from "@polkadot/types";
import { waitFor } from '$lib/utils';

import type { KeyringPair } from '@polkadot/keyring/types';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { isFunction, u8aToHex, u8aWrapBytes } from '@polkadot/util';
import type { SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { PalletMsaAddKeyData } from '@polkadot/types/lookup';
import type { Account } from './stores/accountsStore';
import { handleResult, handleTxnError } from './stores/activityLogStore';

type AddKeyData = { msaId: string; expiration: string; newPublicKey: string };

export const CENTS: bigint = 1000000n;
export const DOLLARS: bigint = 100n * CENTS;

// No functions in here should have to talk to a component
export async function getBlockNumber(api: ApiPromise): Promise<bigint> {
  if (api && (await api.isReady)) {
    const blockData = await api.rpc.chain.getBlock();
    return blockData.block.header.number.toBigInt();
  }
  return 0n;
}

export async function getEpoch(api: ApiPromise): Promise<bigint> {
  if (api && (await api.isReady)) {
    return (await api.query.capacity.currentEpoch()).toBigInt();
  }
  return 0n;
}

// creates the payloads and gets or creates the signatures, then submits the extrinsic
export async function submitAddControlKey(
  api: ApiPromise,
  extension: InjectedExtension | undefined,
  newAccount: Account,
  signingAccount: Account,
  msaId: number
) {
  const blockNumber = (await getBlockNumber(api)) as bigint;
  if (api && (await api.isReady)) {
    const rawPayload: AddKeyData = {
      msaId: msaId.toString(),
      expiration: (blockNumber + 100n).toString(),
      newPublicKey: newAccount.address,
    };

    const newKeyPayload = api.registry.createType('PalletMsaAddKeyData', rawPayload);

    const ownerKeySignature = await signPayload(newKeyPayload, signingAccount, extension);
    const newKeySignature = await signPayload(newKeyPayload, newAccount, extension);

    const ownerKeyProof = { Sr25519: ownerKeySignature };
    const newKeyProof = { Sr25519: newKeySignature };
    const extrinsic = api.tx.msa.addPublicKeyToMsa(
      signingAccount.address,
      ownerKeyProof,
      newKeyProof,
      newKeyPayload as PalletMsaAddKeyData
    );
    submitExtinsic(extrinsic, signingAccount, extension);
  } else {
    console.debug('api is not available.');
  }
}

// creates the payloads and gets or creates the signatures, then submits the extrinsic
export async function submitStake(
  api: ApiPromise,
  extension: InjectedExtension | undefined,
  signingAccount: Account,
  providerId: number,
  stakeAmount: bigint
) {
  if (api && (await api.isReady)) {
    const extrinsic = api.tx.capacity?.stake(providerId, stakeAmount);
    submitExtinsic(extrinsic, signingAccount, extension);
  } else {
    console.debug('api is not available.');
  }
}

function submitExtinsic(
  extrinsic: SubmittableExtrinsic,
  account: Account,
  extension: InjectedExtension | undefined
): Promise<string> {
  if (account.keyringPair) return submitExtrinsicWithKeyring(extrinsic, account.keyringPair);
  if (extension) return submitExtrinsicWithExtension(extension, extrinsic, account.address);
  throw new Error('Unable to find wallet extension');
}

// use the Polkadot extension the user selected to submit the provided extrinsic
async function submitExtrinsicWithExtension(
  extension: InjectedExtension,
  extrinsic: SubmittableExtrinsic,
  signingAddress: string
): Promise<string> {
  // let currentTxDone = false; // eslint-disable-line prefer-const
  try {
    await extrinsic.signAndSend(signingAddress, { signer: extension.signer, nonce: -1 }, handleResult);
    // await waitFor(() => currentTxDone);
  } catch (e: any) {
    const message: string = e.toString();
    console.debug('caught exception:', message);
    if (message.match(/timeout/i) === null) {
      handleTxnError(extrinsic.hash.toString(), message);
    }
  }
  return extrinsic.hash.toString();
}

// Use the built-in test accounts to submit an extrinsic
async function submitExtrinsicWithKeyring(
  extrinsic: SubmittableExtrinsic,
  signingAccount: KeyringPair
): Promise<string> {
  try {
    await extrinsic.signAndSend(signingAccount, { nonce: -1 }, handleResult);
  } catch (e: any) {
    handleTxnError(extrinsic.hash.toString(), e.toString());
  }
  return extrinsic.hash.toString();
}

async function signPayload(payload: any, account: Account, extension: InjectedExtension | undefined): Promise<string> {
  if (account.keyringPair) return signPayloadWithKeyring(account.keyringPair, payload);
  if (extension) return await signPayloadWithExtension(extension, account.address, payload);
  throw new Error('Unable to find wallet extension');
}

// Use the user's selected Polkadot extension to sign some data
// converting to Sr25519Signature is very important, otherwise the signature length
// is incorrect - just using signature gives:
// Enum(Sr25519):: Expected input with 64 bytes (512 bits), found 15 bytes
export async function signPayloadWithExtension(
  injector: InjectedExtension,
  signingPublicKey: string,
  payload: any
): Promise<string> {
  const signer = injector?.signer;
  let signed: SignerResult;
  if (signer && isFunction(signer.signRaw)) {
    // u8aWrapBytes literally just puts <Bytes></Bytes> around the payload.
    const payloadWrappedToU8a = u8aWrapBytes(payload.toU8a());
    const signerPayloadRaw: SignerPayloadRaw = {
      address: signingPublicKey,
      data: u8aToHex(payloadWrappedToU8a),
      type: 'bytes',
    };
    try {
      signed = await signer.signRaw(signerPayloadRaw);
      return signed?.signature;
    } catch (e: any) {
      return 'ERROR ' + e.message;
    }
  }
  return 'Unknown error';
}

// Use the built-in Alice..Ferdie accounts to sign some data
// returns a properly formatted signature to submit with an extrinsic
export function signPayloadWithKeyring(signingAccount: KeyringPair, payload: any): string {
  try {
    // u8aWrapBytes literally puts <Bytes></Bytes> around the payload.
    return u8aToHex(signingAccount.sign(u8aWrapBytes(payload.toU8a())));
  } catch (e: any) {
    return 'ERROR ' + e.message;
  }
}

//   api: ApiPromise,
//   extension: InjectedExtension | undefined,
//   endpointURL: string,
//   signingAccount: Account,
//   providerName: number,
//   txnStatusCallback: (statusStr: string) => void
//   txnFinishedCallback: () => void
export async function submitCreateProvider(
  api: ApiPromise | undefined,
  extension: InjectedExtension | undefined,
  signingAccount: Account,
  providerName: string
): Promise<string | undefined> {
  if (api && (await api.isReady)) {
    const extrinsic: SubmittableExtrinsic = api.tx.msa.createProvider(providerName);
    const txnId = submitExtinsic(extrinsic, signingAccount, extension);
    return txnId;
  }
}

export async function submitRequestToBeProvider(
  api: ApiPromise | undefined,
  extension: InjectedExtension | undefined,
  signingAccount: Account,
  providerName: string
): Promise<string | undefined> {
  if (api && (await api.isReady)) {
    const extrinsic = api.tx.msa.proposeToBeProvider(providerName);
    const txnId = submitExtinsic(extrinsic, signingAccount, extension);
    return txnId;
  }
  console.error('submit failed because api is', api);
}

//Use the current api and signing account to create an MSA for this account
export async function submitCreateMsa(
  api: ApiPromise | undefined,
  extension: InjectedExtension | undefined,
  signingAccount: Account
): Promise<string | undefined> {
  if (api && (await api.isReady)) {
    const extrinsic = api.tx.msa.create();
    const txnId = submitExtinsic(extrinsic, signingAccount, extension);
    return txnId;
  }
}
