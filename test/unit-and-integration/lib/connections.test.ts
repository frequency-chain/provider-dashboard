import {
  getBlockNumber,
  getEpoch,
  signPayloadWithExtension,
  signPayloadWithKeyring,
  submitAddControlKey,
} from '../../../src/lib/connections';
import { describe, expect, test } from 'vitest';
import { ApiPromise } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { stringToU8a } from '@polkadot/util';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';

const mocks = vi.hoisted(() => {
  // this has to be inside here because otherwise the error will be
  // 'Cannot access TestCodec before initialization'
  class TestCodec {
    value: bigint;
    constructor(val: bigint) {
      this.value = val;
    }
    toBigInt(): bigint {
      return this.value;
    }
  }
  class TestDetectCodec<T, K> { // eslint-disable-line no-unused-vars
    value: string;
    constructor(val: string) {
      this.value = val;
    }
    toU8a(): Uint8Array {
      return stringToU8a(this.value);
    }
  }

  class TestSigner {
    signingId: number;
    constructor(val: number) {
      this.signingId = val;
    }
    public async signPayload(_: SignerPayloadJSON): Promise<SignerResult> {
      return { id: this.signingId, signature: '0xdeadbeef' };
    }
    public async signRaw(_: SignerPayloadRaw): Promise<SignerResult> {
      return { id: this.signingId, signature: '0xc0ffeec0ffee' };
    }
  }

  const mockApiPromise = vi.fn();
  const epochNumber = new TestCodec(101n);
  const mockCreatedType = new TestDetectCodec('hello world');
  const blockData = {
    block: { header: { number: new TestCodec(1001n) } },
  };
  const resolvedCurrentEpochChain = {
    isReady: vi.fn().mockResolvedValue(true),
    query: {
      capacity: { currentEpoch: vi.fn().mockResolvedValue(epochNumber) },
    },
    rpc: { chain: { getBlock: vi.fn().mockResolvedValue(blockData) } },
    registry: { createType: vi.fn().mockResolvedValue(mockCreatedType) },
    tx: { msa: { addPublicKeyToMsa: vi.fn().mockResolvedValue(undefined) } },
  };
  mockApiPromise.create = vi.fn().mockResolvedValue(resolvedCurrentEpochChain);

  const mockWeb3FromSource = vi.fn();
  const testSigner = { signer: new TestSigner(123) };
  const mockExtension = vi.fn().mockResolvedValue(testSigner);
  return {
    ApiPromise: mockApiPromise,
    InjectedExtension: mockExtension,
    web3FromSource: mockWeb3FromSource,
  };
});

vi.mock('@polkadot/api', async () => {
  return { ApiPromise: mocks.ApiPromise };
});
vi.mock('@polkadot/extension-inject/types', async () => {
  return { InjectedExtension: mocks.InjectedExtension };
});
vi.mock('@polkadot/extension-dapp', async () => {
  return { web3FromSource: mocks.web3FromSource };
});
describe('getEpoch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('getEpoch works', async () => {
    const mockApi = await ApiPromise.create();
    const ce = await getEpoch(mockApi);
    expect(ce).toBe(101n);
  });
});

describe('getBlockNumber', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getBlockNumber works', async () => {
    const mockApi = await ApiPromise.create();
    const bn = await getBlockNumber(mockApi);
    expect(bn).toBe(1001n);
  });
});
describe('submitAddControlKey', async () => {
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');
  const bob = keyring.addFromUri('//Bob');

  // TODO: probably separate this into a different file so can mock signPayloadWith(Keyring|Extension)
  it('calls the callback when localhost', async () => {
    const api = await ApiPromise.create();
    const extension = undefined;
    const callback = vi.fn();
    const providerId = 4;
    const endpointURL = 'ws://localhost:9944';
    await submitAddControlKey(api, extension, bob, alice, providerId, endpointURL, callback);
    expect(callback).toHaveBeenCalled();
  });
  it('calls the callback when not localhost', async () => {
    const api = await ApiPromise.create();
    const extension = undefined;
    const callback = vi.fn();
    const providerId = 4;
    const endpointURL = 'ws://someotherhost:9944';
    await submitAddControlKey(api, extension, bob, alice, providerId, endpointURL, callback);
    expect(callback).toHaveBeenCalled();
  });
});

describe('signPayloadWithKeyring', () => {
  it('returns a hex signature', async () => {
    const keyring = new Keyring({ type: 'sr25519' });
    const signer = keyring.addFromUri('//Charlie');

    const mockApi = await ApiPromise.create();
    const message = await mockApi.registry.createType('MyMessage', 'Anything');
    const result = signPayloadWithKeyring(signer, message);
    expect(result).toMatch(/^0x/);
    expect(result.length).toEqual(130);
  });
});

describe('signPayloadWithExtension', () => {
  it("returns the expected 'signature'", async () => {
    const mockApi = await ApiPromise.create();
    const message = await mockApi.registry.createType('MyMessage', 'Anything');
    const injected = await mocks.InjectedExtension();
    const result = await signPayloadWithExtension(injected, '//Someone', message);
    expect(result).toEqual('0xc0ffeec0ffee');
  });
});
