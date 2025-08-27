import {
  getBlockNumber,
  getEpoch,
  signPayloadWithExtension,
  signPayloadWithKeyring,
  submitAddControlKey,
} from '$lib/connections';
import { Account } from '$lib/stores/accountsStore';
import { ApiPromise } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { stringToU8a } from '@polkadot/util';
import { waitReady } from '@polkadot/wasm-crypto';
import { describe, expect, test, vi } from 'vitest';

await waitReady();

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

  class TestDetectCodec<T, K> {
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

  const mockApiPromise: any = vi.fn();
  const epochNumber = new TestCodec(101n);
  const mockCreatedType = new TestDetectCodec('hello world');
  const blockData = {
    block: { header: { number: new TestCodec(1001n) } },
  };
  const resolvedCurrentEpochChain = {
    isReady: vi.fn().mockResolvedValue(true),
    query: {
      capacity: {
        currentEpoch: vi.fn().mockResolvedValue(epochNumber),
        capacityLedger: vi.fn().mockResolvedValue({
          isSome: true,
          unwrap: () => ({
            remainingCapacity: { toBigInt: () => 1000n },
          }),
        }),
      },
    },
    rpc: {
      chain: { getBlock: vi.fn().mockResolvedValue(blockData) },
      frequencyTxPayment: {
        computeCapacityFeeDetails: vi.fn().mockResolvedValue({
          inclusionFee: {
            unwrap: vi.fn().mockReturnValue({
              baseFee: { toNumber: () => 1, toBigInt: () => 1n },
              lenFee: { toNumber: () => 2, toBigInt: () => 2n },
              adjustedWeightFee: { toNumber: () => 3, toBigInt: () => 3n },
            }),
          },
        }),
      },
    },
    registry: { createType: vi.fn().mockReturnValue(mockCreatedType) },
    tx: {
      msa: {
        addPublicKeyToMsa: vi.fn(() => ({
          signAndSend: vi.fn(),
          hash: { toString: () => '0x123456', toHex: () => '0x123456' },
        })),
      },
      frequencyTxPayment: {
        payWithCapacity: vi.fn(() => ({
          signAsync: vi.fn().mockResolvedValue(true),
          toHex: vi.fn().mockReturnValue('0xdeadbeef'),
          hash: { toString: () => '0x123456', toHex: () => '0x123456' },
        })),
      },
    },
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

vi.mock('@polkadot/api', () => {
  class MockKeyring {
    addFromUri = vi.fn().mockReturnValue({
      sign: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    });
  }
  return {
    Keyring: MockKeyring,
    ApiPromise: mocks.ApiPromise,
  };
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
  const keyRingPairA = keyring.addFromUri('//Alice');
  const keyRingPairB = keyring.addFromUri('//Bob');

  const alice = new Account();
  const bob = new Account();

  alice.keyringPair = keyRingPairA;
  alice.address = keyRingPairA.address;
  bob.keyringPair = keyRingPairB;
  bob.address = keyRingPairB.address;

  // TODO: probably separate this into a different file so can mock signPayloadWith(Keyring|Extension)
  it('calls the correct extrinsic with keyring pair', async () => {
    const api = await ApiPromise.create();
    const extension = undefined;
    const msaId = 4;
    await submitAddControlKey(api, extension, bob, alice, msaId);
    expect(api.tx.msa.addPublicKeyToMsa).toHaveBeenCalled();
  }, 7000);
});

describe('signPayloadWithKeyring', () => {
  it('returns a hex signature', async () => {
    const keyring = new Keyring({ type: 'sr25519' });
    const signer = keyring.addFromUri('//Charlie');

    const mockApi = await ApiPromise.create();
    const message = mockApi.registry.createType('MyMessage', 'Anything');
    const result = signPayloadWithKeyring(signer, message);
    expect(result).toMatch(/^0x/);
    expect(result.length).toEqual(130);
  });
});

describe('signPayloadWithExtension', () => {
  it("returns the expected 'signature'", async () => {
    const mockApi = await ApiPromise.create();
    const message = mockApi.registry.createType('MyMessage', 'Anything');
    const injected = await mocks.InjectedExtension();
    const result = await signPayloadWithExtension(injected, '//Someone', message);
    expect(result).toEqual('0xc0ffeec0ffee');
  });
});
