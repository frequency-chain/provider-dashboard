import { ApiPromise } from '@polkadot/api';
import { Option, u64 } from '@polkadot/types-codec';
import { vi } from 'vitest';
import { createApi, getBalances, getControlKeys, getMsaInfo, getToken } from '../../src/lib/polkadotApi';

vi.mock('@polkadot/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@polkadot/api')>();
  return {
    ...actual,
    ApiPromise: class extends actual.ApiPromise {
      static create = vi.fn().mockResolvedValue({
        isReady: Promise.resolve(true),
      });
    },
  };
});

vi.mock('@polkadot/rpc-provider', () => {
  return {
    WsProvider: vi.fn(),
  };
});

describe('createApi', async () => {
  it('returns initializedDotApi', async () => {
    const endpoint = 'wss://rpc.polkadot.io';
    const mockApi = await createApi(endpoint);

    expect(mockApi.wsProvider).toBeDefined();
    expect(mockApi.api.isReady).resolves.toBe(true);
    expect(mockApi.keyring).toBeDefined();
    expect(mockApi.selectedEndpoint).toBe(endpoint);
    expect(mockApi.options).toBeDefined();
  });
});

describe('getToken', async () => {
  describe('getToken', () => {
    it('works with token symbols', () => {
      const chain = {
        tokenSymbol: {
          toString: () => '"FREQ"',
        },
      } as any;

      expect(getToken(chain)).toBe('FREQ');
    });

    it('returns empty string if tokenSymbol is just quotes', () => {
      const chain = {
        tokenSymbol: {
          toString: () => '""',
        },
      } as any;

      expect(getToken(chain)).toBe('');
    });
  });
});

describe('getBalances', () => {
  it('returns correct balances when account has free, frozen, and reserved funds', async () => {
    const mockAccountData = {
      data: {
        free: { toBigInt: () => 1000n },
        frozen: { toBigInt: () => 200n },
        reserved: { toBigInt: () => 300n },
      },
    };

    const mockApi = {
      query: {
        system: {
          account: vi.fn().mockResolvedValue(mockAccountData),
        },
      },
    } as unknown as ApiPromise;

    const balances = await getBalances(mockApi, 'Alice');

    expect(balances).toEqual({
      transferable: 800n, // 1000 - 200
      locked: 200n,
      total: 1300n, // 1000 + 300
    });
    expect(mockApi.query.system.account).toHaveBeenCalledWith('Alice');
  });

  it('returns zero balances if all fields are zero', async () => {
    const mockAccountData = {
      data: {
        free: { toBigInt: () => 0n },
        frozen: { toBigInt: () => 0n },
        reserved: { toBigInt: () => 0n },
      },
    };

    const mockApi = {
      query: {
        system: {
          account: vi.fn().mockResolvedValue(mockAccountData),
        },
      },
    } as unknown as ApiPromise;

    const balances = await getBalances(mockApi, 'Bob');

    expect(balances).toEqual({
      transferable: 0n,
      locked: 0n,
      total: 0n,
    });
  });

  it('handles case where locked is greater than free (transferable becomes negative)', async () => {
    const mockAccountData = {
      data: {
        free: { toBigInt: () => 100n },
        frozen: { toBigInt: () => 200n },
        reserved: { toBigInt: () => 50n },
      },
    };

    const mockApi = {
      query: {
        system: {
          account: vi.fn().mockResolvedValue(mockAccountData),
        },
      },
    } as unknown as ApiPromise;

    const balances = await getBalances(mockApi, 'Charlie');

    expect(balances).toEqual({
      transferable: -100n, // 100 - 200
      locked: 200n,
      total: 150n, // 100 + 50
    });
  });
});

describe('getMsaInfo', () => {
  const mockU64 = (num: number) =>
    ({
      toNumber: () => num,
    }) as unknown as u64;

  const mockOptionNone = {
    isSome: false,
    unwrap: vi.fn(),
    unwrapOrDefault: vi.fn(() => mockU64(0)),
  };

  const mockOptionSome = <T>(value: T) => ({
    isSome: true,
    unwrap: vi.fn(() => value),
    unwrapOrDefault: vi.fn(() => value),
  });

  it('returns default MsaInfo when msaId is 0', async () => {
    const mockApi = {
      query: {
        msa: {
          publicKeyToMsaId: vi.fn().mockResolvedValue(mockOptionNone as unknown as Option<u64>),
          providerToRegistryEntry: vi.fn(),
        },
      },
    } as unknown as ApiPromise;

    const info = await getMsaInfo(mockApi, 'fakePublicKey');

    expect(info).toEqual({ isProvider: false, msaId: 0, providerName: '' });
    expect(mockApi.query.msa.publicKeyToMsaId).toHaveBeenCalledWith('fakePublicKey');
    expect(mockApi.query.msa.providerToRegistryEntry).not.toHaveBeenCalled();
  });

  it('returns msaId without provider when registry entry is None', async () => {
    const mockU64 = { toNumber: () => 123 } as unknown as u64;

    const mockApi = {
      query: {
        msa: {
          publicKeyToMsaId: vi.fn().mockResolvedValue(mockOptionSome(mockU64) as unknown as Option<u64>),
          providerToRegistryEntry: vi.fn().mockResolvedValue(mockOptionNone),
        },
      },
    } as unknown as ApiPromise;

    const info = await getMsaInfo(mockApi, 'pk');

    expect(info).toEqual({ isProvider: false, msaId: 123, providerName: '' });
  });

  it('returns msaId with provider info when registry entry is Some', async () => {
    const mockU64 = { toNumber: () => 456 } as unknown as u64;
    const registryEntry = { providerName: { toString: () => 'AcmeProvider' } };

    const mockApi = {
      query: {
        msa: {
          publicKeyToMsaId: vi.fn().mockResolvedValue(mockOptionSome(mockU64) as unknown as Option<u64>),
          providerToRegistryEntry: vi.fn().mockResolvedValue(mockOptionSome(registryEntry)),
        },
      },
    } as unknown as ApiPromise;

    const info = await getMsaInfo(mockApi, 'pk2');

    expect(info).toEqual({ isProvider: true, msaId: 456, providerName: 'AcmeProvider' });
  });
});

describe('getControlKeys', () => {
  it('returns keys when msa_keys exist', async () => {
    const fakeKeys = ['0xabc', '0xdef'];
    const mockApi = {
      rpc: {
        msa: {
          getKeysByMsaId: vi.fn().mockResolvedValue({
            toHuman: () => ({ msa_keys: fakeKeys }),
          }),
        },
      },
    } as unknown as ApiPromise;

    const result = await getControlKeys(mockApi, 123);

    expect(result).toEqual(fakeKeys);
    expect(mockApi.rpc.msa.getKeysByMsaId).toHaveBeenCalledWith(123);
  });

  it('throws an error when msa_keys is missing', async () => {
    const mockApi = {
      rpc: {
        msa: {
          getKeysByMsaId: vi.fn().mockResolvedValue({
            toHuman: () => ({}), // no msa_keys
          }),
        },
      },
    } as unknown as ApiPromise;

    await expect(getControlKeys(mockApi, 456)).rejects.toThrow('Keys not found for 456');
  });
});
