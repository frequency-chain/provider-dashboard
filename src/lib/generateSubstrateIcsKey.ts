/**
 * This file is a pure JS implementation of the seed & key derivation in `@projectlibertylabs/ics-sdk`,
 * which can't be used here because it contains native code that will not execute in a browser.
 */

import { ed25519 } from '@noble/curves/ed25519.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha512 } from '@noble/hashes/sha2';
import { generateMnemonic, mnemonicToEntropy, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

// Returns 64-byte BIP39 seed (like PBKDF2-HMAC-SHA512 output)
function substrateSeed64FromMnemonic(mnemonic: string, passphrase = ''): Promise<Uint8Array> {
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error('Invalid BIP39 mnemonic');
  }

  const entropy = mnemonicToEntropy(mnemonic, wordlist); // Uint8Array
  const salt = new TextEncoder().encode(`mnemonic${passphrase}`);

  return pbkdf2Async(sha512, entropy, salt, { c: 2048, dkLen: 64 });
}

// Uses first 32 bytes as Ed25519 seed, similar to dryoc/libsodium seed_keypair
function ed25519KeypairFromSeed64(seed64: Uint8Array) {
  if (seed64.length !== 64) throw new Error('seed64 must be 64 bytes');

  const seed32 = seed64.slice(0, 32);
  const publicKey = ed25519.getPublicKey(seed32); // 32 bytes

  // libsodium/dryoc-style 64-byte secret key: seed || publicKey
  const secretKey = new Uint8Array(64);
  secretKey.set(seed32, 0);
  secretKey.set(publicKey, 32);

  return { seed64, seed32, publicKey, secretKey };
}

export async function generateSubstrateKeypair(): Promise<[{ publicKey: Uint8Array; secretKey: Uint8Array }, string]> {
  const mnemonic = generateMnemonic(wordlist, 256);
  const jsSeed = await substrateSeed64FromMnemonic(mnemonic);
  const { publicKey, secretKey } = ed25519KeypairFromSeed64(jsSeed);
  return [{ publicKey, secretKey }, mnemonic];
}
