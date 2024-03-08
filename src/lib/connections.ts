import type { ApiPromise } from '@polkadot/api/promise';
// @ts-ignore
// import { SignerResult } from "@polkadot/types";
import { isLocalhost, waitFor } from '$lib/utils';

import type { KeyringPair } from '@polkadot/keyring/types';
import type { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';
import { isFunction, u8aToHex, u8aWrapBytes } from '@polkadot/util';
import type { SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { PalletMsaAddKeyData } from '@polkadot/types/lookup';
import { handleResult, handleTxnError } from './stores/activityLogStore';

type AddKeyData = { msaId: string; expiration: string; newPublicKey: string };
export type SigningKey = InjectedAccountWithMeta | KeyringPair;

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
  newAccount: SigningKey,
  signingAccount: SigningKey,
  msaId: number,
  endpointURL: string
) {
  const blockNumber = (await getBlockNumber(api)) as bigint;
  if (api && (await api.isReady)) {
    const rawPayload: AddKeyData = {
      msaId: msaId.toString(),
      expiration: (blockNumber + 100n).toString(),
      newPublicKey: newAccount.address,
    };

    const newKeyPayload = api.registry.createType('PalletMsaAddKeyData', rawPayload);
    const useKeyring: boolean = isLocalhost(endpointURL);

    const ownerKeySignature = useKeyring
      ? signPayloadWithKeyring(signingAccount as KeyringPair, newKeyPayload)
      : await signPayloadWithExtension(extension as InjectedExtension, signingAccount.address, newKeyPayload);

    const newKeySignature = useKeyring
      ? signPayloadWithKeyring(newAccount as KeyringPair, newKeyPayload)
      : await signPayloadWithExtension(extension as InjectedExtension, newAccount.address, newKeyPayload);

    const ownerKeyProof = { Sr25519: ownerKeySignature };
    const newKeyProof = { Sr25519: newKeySignature };
    const extrinsic = api.tx.msa.addPublicKeyToMsa(
      signingAccount.address,
      ownerKeyProof,
      newKeyProof,
      newKeyPayload as PalletMsaAddKeyData
    );
    useKeyring
      ? await submitExtrinsicWithKeyring(extrinsic, signingAccount as KeyringPair)
      : await submitExtrinsicWithExtension(extension as InjectedExtension, extrinsic, signingAccount.address);
  } else {
    console.debug('api is not available.');
  }
}

// creates the payloads and gets or creates the signatures, then submits the extrinsic
export async function submitStake(
  api: ApiPromise,
  extension: InjectedExtension | undefined,
  signingAccount: SigningKey,
  providerId: number,
  stakeAmount: bigint,
  endpointURL: string
) {
  if (api && (await api.isReady)) {
    const useKeyring: boolean = isLocalhost(endpointURL);

    setTimeout(async () => {
      const extrinsic = api.tx.capacity.stake(providerId, stakeAmount);
      useKeyring
        ? await submitExtrinsicWithKeyring(extrinsic, signingAccount as KeyringPair)
        : await submitExtrinsicWithExtension(extension as InjectedExtension, extrinsic, signingAccount.address);
    }, 0);
  } else {
    console.debug('api is not available.');
  }
}

// use the Polkadot extension the user selected to submit the provided extrinsic
async function submitExtrinsicWithExtension(
  extension: InjectedExtension,
  extrinsic: SubmittableExtrinsic,
  signingAddress: string
): Promise<void> {
  let currentTxDone = false; // eslint-disable-line prefer-const
  try {
    await extrinsic.signAndSend(
      signingAddress,
      { signer: extension.signer, nonce: -1 },
      handleResult(extrinsic.hash.toString())
    );
    await waitFor(() => currentTxDone);
  } catch (e: any) {
    const message: string = e.toString();
    console.debug('caught exception:', message);
    if (message.match(/timeout/i) === null) {
      handleTxnError(extrinsic.hash.toString(), message);
    }
  }
}

// Use the built-in test accounts to submit an extrinsic
async function submitExtrinsicWithKeyring(extrinsic: SubmittableExtrinsic, signingAccount: KeyringPair): Promise<void> {
  try {
    // TODO
    // txnStatusCallback('Submitting transaction', extrinsic.hash.toString());
    await extrinsic.signAndSend(signingAccount, { nonce: -1 }, handleResult(extrinsic.hash.toString()));
  } catch (e: any) {
    handleTxnError(extrinsic.hash.toString(), e.toString());
  }
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
//   signingAccount: SigningKey,
//   providerName: number,
//   txnStatusCallback: (statusStr: string) => void
//   txnFinishedCallback: () => void
export async function submitCreateProvider(
  api: ApiPromise | undefined,
  extension: InjectedExtension | undefined,
  endpointURL: string,
  signingAccount: SigningKey,
  providerName: string
): Promise<boolean> {
  if (api && (await api.isReady)) {
    const extrinsic: SubmittableExtrinsic = api.tx.msa.createProvider(providerName);
    const useKeyring: boolean = isLocalhost(endpointURL);

    useKeyring
      ? submitExtrinsicWithKeyring(extrinsic, signingAccount as KeyringPair)
      : submitExtrinsicWithExtension(extension as InjectedExtension, extrinsic, signingAccount.address);
    return true;
  }
  return false;
}

export async function submitRequestToBeProvider(
  api: ApiPromise | undefined,
  extension: InjectedExtension | undefined,
  endpointURL: string,
  signingAccount: SigningKey,
  providerName: string
): Promise<boolean> {
  if (api && (await api.isReady)) {
    const useKeyring: boolean = isLocalhost(endpointURL);

    const extrinsic = api.tx.msa.proposeToBeProvider(providerName);
    useKeyring
      ? submitExtrinsicWithKeyring(extrinsic, signingAccount as KeyringPair)
      : submitExtrinsicWithExtension(extension as InjectedExtension, extrinsic, signingAccount.address);
    return true;
  }
  console.error('submit failed because api is', api);
  return false;
}

//Use the current api and signing account to create an MSA for this account
export async function submitCreateMsa(
  api: ApiPromise | undefined,
  extension: InjectedExtension | undefined,
  endpointURL: string,
  signingAccount: SigningKey
): Promise<boolean> {
  if (api && (await api.isReady)) {
    const extrinsic = api.tx.msa.create();
    const useKeyring: boolean = isLocalhost(endpointURL);

    useKeyring
      ? submitExtrinsicWithKeyring(extrinsic, signingAccount as KeyringPair)
      : submitExtrinsicWithExtension(extension as InjectedExtension, extrinsic, signingAccount.address);
    return true;
  }
  return false;
}
