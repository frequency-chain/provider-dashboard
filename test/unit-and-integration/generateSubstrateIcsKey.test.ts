import IcsApi, { IcsKeyType } from '@projectlibertylabs/ics-sdk';
import { describe, expect, it } from "vitest";
import { generateSubstrateKeypair } from '$lib/generateSubstrateIcsKey';

const icsSdk = new IcsApi();

describe('Native vs JS key generation', () => {
  it('should generate the same keypair', async () => {
    const [jsKeypair, mnemonic] = await generateSubstrateKeypair();
    const nativeSeed = icsSdk.deriveMasterSeedFromMnemonic(mnemonic);
    const { publicKey, secretKey} = icsSdk.deriveUserKeyPair(nativeSeed, IcsKeyType.Ed25519);
    const nativeKeypair = { publicKey, secretKey };

    expect(jsKeypair.publicKey.length).toBe(nativeKeypair.publicKey.length);
    expect(jsKeypair.secretKey.length).toBe(nativeKeypair.secretKey.length);
    expect(Buffer.from(jsKeypair.publicKey)).toStrictEqual(Buffer.from(nativeKeypair.publicKey));
  })
})
