import * as connections from '$lib/connections';
import { Account } from '$lib/stores/accountsStore';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Keyring } from '@polkadot/keyring';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { stringToU8a } from '@polkadot/util';
import { waitReady } from '@polkadot/wasm-crypto';
import { Mock, describe, expect, vi } from 'vitest';
import { getEpoch, signPayloadWithExtension, signPayloadWithKeyring } from '../../src/lib/connections';
import { checkCapacityForExtrinsic, checkFundsForExtrinsic } from '../../src/lib/utils';

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
  const mockExtrinsic = {
    signAsync: vi.fn().mockResolvedValue(true),
    toHex: vi.fn().mockReturnValue('0xdeadbeef'),
    hash: { toString: () => '0x123456', toHex: () => '0x123456' },
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
            totalTokensStaked: { toBigInt: () => 500n },
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
        proposeToBeProvider: vi.fn(() => ({
          signAndSend: vi.fn(),
          hash: { toString: () => '0x123456', toHex: () => '0x123456' },
        })),
        createProvider: vi.fn(() => ({
          signAndSend: vi.fn(),
          hash: { toString: () => '0x123456', toHex: () => '0x123456' },
        })),
        create: vi.fn(() => ({
          signAndSend: vi.fn(),
          hash: { toString: () => '0x123456', toHex: () => '0x123456' },
        })),
      },
      frequencyTxPayment: {
        payWithCapacity: vi.fn(() => mockExtrinsic),
      },
      capacity: {
        stake: vi.fn(() => mockExtrinsic),
        unstake: vi.fn(() => mockExtrinsic),
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

vi.mock('$lib/utils', () => ({
  checkCapacityForExtrinsic: vi.fn().mockResolvedValue(true),
  checkFundsForExtrinsic: vi.fn(),
}));

vi.mock('$lib/connections', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/connections')>();
  return {
    ...actual,
    signPayload: vi.fn(),
  };
});
const mockExtrinsic = {
  signAndSend: vi.fn().mockResolvedValue('txHash'),
  signAsync: vi.fn().mockResolvedValue('signedExtrinsic'),
  toHex: vi.fn().mockReturnValue('0x1234'),
  hash: { toHex: () => '0x1234', toString: () => '0x1234' },
} as unknown as SubmittableExtrinsic<'promise'>;
const notReadyMockApi = { isReady: false } as unknown as ApiPromise;
const mockApi = await ApiPromise.create();
const mockSignPayload = vi.fn().mockImplementation(async (payload: SignerPayloadJSON): Promise<SignerResult> => {
  return {
    id: 1,
    signature: '0x123',
    signedTransaction: '0x123',
  };
});

const extension = {
  signer: {
    signPayload: mockSignPayload,
  },
};
const msaId = 4;

let alice: Account;
let bob: Account;

beforeEach(() => {
  const keyring = new Keyring({ type: 'sr25519' });
  const keyRingPairA = keyring.addFromUri('//Alice');
  const keyRingPairB = keyring.addFromUri('//Bob');

  alice = new Account();
  bob = new Account();

  alice.keyringPair = keyRingPairA;
  alice.address = keyRingPairA.address;
  bob.keyringPair = keyRingPairB;
  bob.address = keyRingPairB.address;
});

describe('getEpoch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('getEpoch works', async () => {
    const ce = await getEpoch(mockApi);
    expect(ce).toBe(101n);
  });
  test('getEpoch returns 0n when api not ready', async () => {
    const ce = await getEpoch(notReadyMockApi);
    expect(ce).toBe(0n);
  });
});

describe('getBlockNumber', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getBlockNumber works', async () => {
    const bn = await connections.getBlockNumber(mockApi);
    expect(bn).toBe(1001n);
  });

  test('getBlockNumber returns 0 when api not ready', async () => {
    const bn = await connections.getBlockNumber(notReadyMockApi);
    expect(bn).toBe(0n);
  });
});

describe('submitAddControlKey', async () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // TODO: probably separate this into a different file so can mock signPayloadWith(Keyring|Extension)
  it('calls the correct extrinsic with keyring pair and capacity', async () => {
    await connections.submitAddControlKey(mockApi, extension, bob, alice, msaId);

    const blockNumber = await connections.getBlockNumber(mockApi);
    expect(blockNumber).toBe(1001n);

    expect(mockApi.registry.createType).toHaveBeenCalled();

    expect(mockApi.tx.msa.addPublicKeyToMsa).toHaveBeenCalled();

    expect(checkCapacityForExtrinsic).toHaveBeenCalled();

    expect(checkFundsForExtrinsic).not.toHaveBeenCalled();

    expect(mockApi.tx.msa.addPublicKeyToMsa).toHaveBeenCalled();

    expect(mockApi.tx.frequencyTxPayment.payWithCapacity).toHaveBeenCalled();
  }, 7000);

  it('calls checkFundsForExtrinsic when no capacity', async () => {
    (checkCapacityForExtrinsic as Mock).mockResolvedValue(false);
    (checkFundsForExtrinsic as Mock).mockResolvedValue(true);

    await connections.submitAddControlKey(mockApi, extension, bob, alice, msaId);

    const blockNumber = await connections.getBlockNumber(mockApi);
    expect(blockNumber).toBe(1001n);

    expect(mockApi.registry.createType).toHaveBeenCalled();

    expect(mockApi.tx.msa.addPublicKeyToMsa).toHaveBeenCalled();

    expect(checkCapacityForExtrinsic).toHaveBeenCalled();

    expect(checkFundsForExtrinsic).toHaveBeenCalled();

    expect(mockApi.tx.msa.addPublicKeyToMsa).toHaveBeenCalled();

    expect(mockApi.tx.frequencyTxPayment.payWithCapacity).not.toHaveBeenCalled();
  }, 7000);

  it('returns null when api is not ready', async () => {
    expect(await connections.submitAddControlKey(notReadyMockApi, extension, bob, alice, msaId)).toBe(undefined);
  }, 7000);

  it('throws Signing Canceled error', async () => {
    delete (alice as any).keyringPair;
    delete (bob as any).keyringPair;

    (connections.signPayload as Mock).mockResolvedValueOnce('0x1234').mockRejectedValueOnce(new Error());

    await expect(connections.submitAddControlKey(mockApi, extension, bob, alice, msaId)).rejects.toThrow(
      'Unknown error'
    );
  }, 7000);
});

describe('submit Stake', () => {
  it('submits extrinsic', async () => {
    (checkFundsForExtrinsic as Mock).mockResolvedValue(true);

    await connections.submitStake(mockApi, extension, alice, msaId, 1n);
    expect(checkFundsForExtrinsic).toHaveBeenCalled();
  });

  it('returns undefined when api is not ready', async () => {
    expect(await connections.submitStake(notReadyMockApi, extension, alice, msaId, 1n)).toBe(undefined);
  });
});

describe('submit UnStake', () => {
  it('submits extrinsic', async () => {
    (checkFundsForExtrinsic as Mock).mockResolvedValue(true);

    await connections.submitUnstake(mockApi, extension, alice, msaId, 1n);
    expect(checkFundsForExtrinsic).toHaveBeenCalled();
    expect(mockApi.query.capacity.capacityLedger).toHaveBeenCalled();
  });

  it('returns undefined when api is not ready', async () => {
    expect(await connections.submitUnstake(notReadyMockApi, extension, alice, msaId, 1n)).toBe(undefined);
  });
});

describe('signPayloadWithKeyring', () => {
  it('returns a hex signature', async () => {
    const keyring = new Keyring({ type: 'sr25519' });
    const signer = keyring.addFromUri('//Charlie');

    const mockApi = await ApiPromise.create();
    const message = mockApi.registry.createType('MyMessage', 'Anything');
    const result = signPayloadWithKeyring(signer, message);
    console.log('RESULT', result);
    expect(result).toMatch('0x');
    expect(result.length).toEqual(130);
  });
});

describe('signPayloadWithExtension', async () => {
  const message = mockApi.registry.createType('MyMessage', 'Anything');
  const injected = await mocks.InjectedExtension();

  it("returns the expected 'signature'", async () => {
    const result = await signPayloadWithExtension(injected, '//Someone', message);
    expect(result).toEqual('0xc0ffeec0ffee');
  });

  it('handles error on signRaw', async () => {
    const throwsErrorInjected = {
      ...injected,
      signer: {
        signRaw: async () => {
          throw new Error('Error when trying to sign');
        },
      },
    };
    expect(signPayloadWithExtension(throwsErrorInjected, '//Someone', message)).rejects.toThrow(
      'Error when trying to sign'
    );
  });
});

describe('submitExtrinsic', () => {
  it('calls submitExtrinsicWithKeyring when account has keyringPair', async () => {
    const mockExtrinsic = {
      signAndSend: vi.fn().mockResolvedValue('txHash'),
      signAsync: vi.fn().mockResolvedValue('signedExtrinsic'),
      toHex: vi.fn().mockReturnValue('0x1234'),
      hash: { toHex: () => '0x1234', toString: () => '0x1234' },
    } as unknown as SubmittableExtrinsic<'promise'>;

    const result = await connections.submitExtrinsic(mockExtrinsic, alice, undefined);

    expect(await connections.submitExtrinsicWithKeyring(mockExtrinsic, alice)).toEqual('0x1234');

    expect(result).toEqual('0x1234');
  });

  it('calls submitExtrinsicWithExtension when account has extension and no keyring', async () => {
    const mockExtrinsic = {
      signAndSend: vi.fn().mockResolvedValue('txHash'),
      signAsync: vi.fn().mockResolvedValue('signedExtrinsic'),
      toHex: vi.fn().mockReturnValue('0x1234'),
      hash: { toHex: () => '0x1234', toString: () => '0x1234' },
    } as unknown as SubmittableExtrinsic<'promise'>;

    delete (alice as any).keyringPair;

    const result = await connections.submitExtrinsic(mockExtrinsic, alice, extension);

    expect(await connections.submitExtrinsicWithExtension(extension, mockExtrinsic, alice.address)).toEqual('0x1234');

    expect(result).toEqual('0x1234');
  });

  it('calls submitExtrinsicWithExtension when account has extension and no keyring but fails to signAndSend', async () => {
    const mockExtrinsic = {
      signAndSend: vi.fn().mockRejectedValue(new Error('Failed to sign and send')),
      signAsync: vi.fn().mockResolvedValue('signedExtrinsic'),
      toHex: vi.fn().mockReturnValue('0x1234'),
      hash: { toHex: () => '0x1234', toString: () => '0x1234' },
    } as unknown as SubmittableExtrinsic<'promise'>;

    delete (alice as any).keyringPair;

    await expect(connections.submitExtrinsicWithExtension(extension, mockExtrinsic, alice.address)).rejects.toThrow(
      'Failed to sign and send'
    );
  });

  it('throws error when account has extension and no keyring', async () => {
    delete (alice as any).keyringPair;

    expect(() => connections.submitExtrinsic(mockExtrinsic, alice, undefined)).toThrow(
      'Unable to find wallet extension'
    );
  });
});

describe('submitCreateProvider', () => {
  const providerName = 'MyProvider';

  it('submits extrinsic', async () => {
    (checkFundsForExtrinsic as Mock).mockResolvedValue(true);

    const result = await connections.submitCreateProvider(mockApi, extension, alice, providerName);

    expect(mockApi.tx.msa.createProvider).toHaveBeenCalledWith(providerName);

    expect(checkFundsForExtrinsic).toHaveBeenCalled();

    expect(() => connections.submitExtrinsic(mockExtrinsic, alice, undefined)).not.toThrow();

    expect(result).toEqual('0x123456');
  });

  it('returns undfined if api is not ready', async () => {
    const result = await connections.submitCreateProvider(notReadyMockApi, extension, alice, providerName);
    expect(result).toBe(undefined);
  });
});

describe('submitRequestToBeProvider', () => {
  const providerName = 'MyProvider';

  it('submits extrinsic', async () => {
    (checkFundsForExtrinsic as Mock).mockResolvedValue(true);

    const result = await connections.submitRequestToBeProvider(mockApi, extension, alice, providerName);

    expect(mockApi.tx.msa.proposeToBeProvider).toHaveBeenCalledWith(providerName);

    expect(checkFundsForExtrinsic).toHaveBeenCalled();

    expect(() => connections.submitExtrinsic(mockExtrinsic, alice, undefined)).not.toThrow();

    expect(result).toEqual('0x123456');
  });

  it('returns undfined if api is not ready', async () => {
    const result = await connections.submitRequestToBeProvider(notReadyMockApi, extension, alice, providerName);
    expect(result).toBe(undefined);
  });
});

describe('submitCreateMsa', () => {
  it('submits extrinsic', async () => {
    (checkFundsForExtrinsic as Mock).mockResolvedValue(true);

    const result = await connections.submitCreateMsa(mockApi, extension, alice);

    expect(checkFundsForExtrinsic).toHaveBeenCalled();

    expect(result).toEqual('0x123456');
  });

  it('returns undfined if api is not ready', async () => {
    const result = await connections.submitCreateMsa(notReadyMockApi, extension, alice);
    expect(result).toBe(undefined);
  });
});
