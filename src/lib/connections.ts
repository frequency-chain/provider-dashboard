import '@frequency-chain/api-augment';
import type { ApiPromise } from '@polkadot/api/promise';

import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { u64 } from '@polkadot/types';
import type { Signer, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { isFunction, u8aToHex, u8aWrapBytes } from '@polkadot/util';
import { get } from 'svelte/store';
import type { Account } from './stores/accountsStore';
import { handleResult, handleTxnError } from './stores/activityLogStore';
import { user } from './stores/userStore';

interface AddKeyData {
  msaId: string;
  expiration: string;
  newPublicKey: string;
}

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
    return ((await api.query.capacity.currentEpoch()) as u64).toBigInt();
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
  if (!api || !(await api.isReady)) {
    console.debug('api is not available.');
    return;
  }

  const blockNumber = (await getBlockNumber(api)) as bigint;

  const rawPayload: AddKeyData = {
    msaId: msaId.toString(),
    expiration: (blockNumber + 100n).toString(),
    newPublicKey: newAccount.address,
  };

  const newKeyPayload = api.registry.createType('PalletMsaAddKeyData', rawPayload);

  // mock signatures for fee estimation
  const mockSignature = '0x' + '00'.repeat(64);
  const mockProof = { Sr25519: mockSignature };
  // mock extrinsic for fee estimation
  const mockExtrinsic = api.tx.msa.addPublicKeyToMsa(signingAccount.address, mockProof, mockProof, newKeyPayload);
  // typecheck for testing
  if (typeof mockExtrinsic.paymentInfo === 'function') {
    // Get estimated total cost of txn & user's transferable balance
    const estTotalCost = (await mockExtrinsic.paymentInfo(signingAccount.address)).partialFee.toBigInt();
    const transferable = BigInt(get(user).balances.transferable);
    // Check for adiquite funds
    if (transferable < estTotalCost) throw new Error('User does not have sufficient funds.');
  }

  // Continue with getting real signatures
  const ownerKeySignature = await signPayload(newKeyPayload, signingAccount, extension);
  const newKeySignature = await signPayload(newKeyPayload, newAccount, extension);

  const ownerKeyProof = { Sr25519: ownerKeySignature };
  const newKeyProof = { Sr25519: newKeySignature };
  const extrinsic = api.tx.msa.addPublicKeyToMsa(signingAccount.address, ownerKeyProof, newKeyProof, newKeyPayload);

  submitExtinsic(extrinsic, signingAccount, extension);
}

// creates the payloads and gets or creates the signatures, then submits the extrinsic
export async function submitStake(
  api: ApiPromise,
  extension: InjectedExtension | undefined,
  signingAccount: Account,
  providerId: number,
  stakeAmount: bigint
) {
  if (!api || !(await api.isReady)) {
    console.debug('api is not available.');
    return;
  }

  // Get the estimated transaction fee (does not submit txn)
  const { partialFee } = await api.tx.capacity.stake(providerId, stakeAmount).paymentInfo(signingAccount.address);
  // Get estimated total cost of txn
  const estTotalCost = BigInt(partialFee.toString()) + stakeAmount;
  // Check for adiquite funds
  const hasFunds = BigInt(get(user).balances.transferable) >= estTotalCost;
  if (!hasFunds) throw new Error('User does not have sufficient funds.');

  // Submit txn
  const extrinsic = api.tx.capacity?.stake(providerId, stakeAmount);
  submitExtinsic(extrinsic, signingAccount, extension);
}

// creates the payloads and gets or creates the signatures, then submits the extrinsic
export async function submitUnstake(
  api: ApiPromise,
  extension: InjectedExtension | undefined,
  signingAccount: Account,
  providerId: number,
  unstakeAmount: bigint
) {
  if (!api || !(await api.isReady)) {
    console.debug('api is not available.');
    return;
  }

  // Get the estimated transaction fee (does not submit txn)
  const { partialFee } = await api.tx.capacity.unstake(providerId, unstakeAmount).paymentInfo(signingAccount.address);
  // Get estimated total cost of txn
  const estTotalCost = BigInt(partialFee.toString()) + unstakeAmount;

  // Check for adiquite funds
  const hasFunds = BigInt(get(user).balances.locked) >= estTotalCost;
  if (!hasFunds) throw new Error('User does not have sufficient funds.');

  const extrinsic = api.tx.capacity?.unstake(providerId, unstakeAmount);
  submitExtinsic(extrinsic, signingAccount, extension);
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
    await extrinsic.signAndSend(signingAddress, { signer: extension.signer as Signer, nonce: -1 }, handleResult);
    // await waitFor(() => currentTxDone);
  } catch (e: unknown) {
    const message: string = `${e}`;
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
  } catch (e: unknown) {
    handleTxnError(extrinsic.hash.toString(), `${e}`);
  }
  return extrinsic.hash.toString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        return 'ERROR ' + e.message;
      }
    }
  }
  return 'Unknown error';
}

// Use the built-in Alice..Ferdie accounts to sign some data
// returns a properly formatted signature to submit with an extrinsic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function signPayloadWithKeyring(signingAccount: KeyringPair, payload: any): string {
  try {
    // u8aWrapBytes literally puts <Bytes></Bytes> around the payload.
    return u8aToHex(signingAccount.sign(u8aWrapBytes(payload.toU8a())));
  } catch (e: unknown) {
    if (e instanceof Error) {
      return 'ERROR ' + e.message;
    }
    return 'UNKNOWN ERROR ' + e;
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
  if (!api || !(await api.isReady)) {
    console.debug('api is not available.');
    return;
  }

  // Get the estimated txn fee (does not submit txn)
  const estTotalCost = (
    await api.tx.msa.createProvider(providerName).paymentInfo(signingAccount.address)
  ).partialFee.toBigInt();

  // Check for adequate funds
  const hasFunds = BigInt(get(user).balances.transferable) >= estTotalCost;
  if (!hasFunds) throw new Error('User does not have sufficient funds.');

  // Submit txn
  const extrinsic: SubmittableExtrinsic = api.tx.msa.createProvider(providerName);
  return submitExtinsic(extrinsic, signingAccount, extension);
}

export async function submitRequestToBeProvider(
  api: ApiPromise | undefined,
  extension: InjectedExtension | undefined,
  signingAccount: Account,
  providerName: string
): Promise<string | undefined> {
  if (!api || !(await api.isReady)) {
    console.debug('api is not available.');
    return;
  }
  // Get the estimated txn fee (does not submit txn)
  const estTotalCost = (
    await api.tx.msa.proposeToBeProvider(providerName).paymentInfo(signingAccount.address)
  ).partialFee.toBigInt();

  // Check for adequate funds
  const hasFunds = BigInt(get(user).balances.transferable) >= estTotalCost;
  if (!hasFunds) throw new Error('User does not have sufficient funds.');

  // submit txn
  const extrinsic: SubmittableExtrinsic = api.tx.msa.proposeToBeProvider(providerName);
  return submitExtinsic(extrinsic, signingAccount, extension);
}

//Use the current api and signing account to create an MSA for this account
export async function submitCreateMsa(
  api: ApiPromise | undefined,
  extension: InjectedExtension | undefined,
  signingAccount: Account
): Promise<string | undefined> {
  if (!api || !(await api.isReady)) {
    console.debug('api is not available.');
    return;
  }
  // Get the estimated txn fee (does not submit txn)
  const estTotalCost = (await api.tx.msa.create().paymentInfo(signingAccount.address)).partialFee.toBigInt();

  // Check for adequate funds
  const hasFunds = BigInt(get(user).balances.transferable) >= estTotalCost;
  if (!hasFunds) throw new Error('User does not have sufficient funds.');

  const extrinsic: SubmittableExtrinsic = api.tx.msa.create();
  return submitExtinsic(extrinsic, signingAccount, extension);
}
