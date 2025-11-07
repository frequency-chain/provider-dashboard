import { createMailto, isLocalhost, isMainnet } from '$lib/utils';
import { web3AccountsSubscribe, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { stringToHex } from '@polkadot/util';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBalances, getMsaInfoForPublicKey } from '../../src/lib/polkadotApi';
import { allAccountsStore } from '../../src/lib/stores/accountsStore';
import { NetworkType } from '../../src/lib/stores/networksStore';
import { user } from '../../src/lib/stores/userStore';
import {
  checkCapacityForExtrinsic,
  checkFundsForExtrinsic,
  getExtension,
  getTransactionCost,
  providerNameToHuman,
  selectNetworkOptions,
  sleep,
  subscribeToAccounts,
  waitFor as waitForFn,
} from '../../src/lib/utils';

vi.mock('../../src/lib/polkadotApi', () => ({
  getMsaInfoForPublicKey: vi.fn().mockResolvedValue({
    msaId: 42,
    isProvider: true,
    providerName: { toString: () => '0x4d7950726f7669646572' },
  }),
  getBalances: vi.fn(),
}));

vi.mock('../../src/lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/utils')>('../../src/lib/utils');
  return {
    ...actual,
    refreshAllBalances: vi.fn(),
  };
});

vi.mock('../../src/lib/stores/userStore', () => {
  const { writable } = require('svelte/store');
  return { user: writable({ balances: { total: 0n } }) };
});

vi.mock('@polkadot/extension-dapp', () => ({
  web3AccountsSubscribe: vi.fn(),
  web3FromSource: vi.fn(),
  web3Enable: vi.fn(),
}));

vi.mock('../../src/lib/stores/accountsStore', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/stores/accountsStore')>(
    '../../src/lib/stores/accountsStore'
  );
  return {
    ...actual,
    allAccountsStore: { set: vi.fn() },
  };
});

describe('sleep', () => {
  it('waits at least the specified time', async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });
});

describe('waitFor', () => {
  it('resolves immediately if predicate is true', async () => {
    const predicate = vi.fn().mockReturnValue(true);
    const result = await waitForFn(predicate, { interval: 10, timeout: 50 });
    expect(result).toBe(true);
    expect(predicate).toHaveBeenCalledTimes(1);
  });

  it('resolves after retries when predicate becomes true', async () => {
    const predicate = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const result = await waitForFn(predicate, { interval: 10, timeout: 50 });
    expect(result).toBe(true);
    expect(predicate).toHaveBeenCalledTimes(2);
  });

  it('throws if timeout exceeded', async () => {
    const predicate = vi.fn().mockResolvedValue(false);
    await expect(waitForFn(predicate, { interval: 10, timeout: 30 })).rejects.toThrow('Timeout');
  });
});

describe('isLocalhost / isMainnet', () => {
  it('correctly identifies localhost URLs', () => {
    expect(isLocalhost('http://localhost:8080')).toBe(true);
    expect(isLocalhost('wss://127.0.0.1:9944')).toBe(true);
    expect(isLocalhost('wss://remote.node')).toBe(false);
    expect(isLocalhost('not a url')).toBe(false);
  });

  it('correctly identifies mainnet URLs', () => {
    expect(isMainnet('wss://0.rpc.frequency.xyz')).toBe(true);
    expect(isMainnet('http://localhost')).toBe(false);
    expect(isMainnet('not a url')).toBe(false);
  });
});

describe('createMailto', () => {
  it('throws on invalid email', () => {
    expect(() => createMailto('foo@bar', 'hi', 'body')).toThrow('to is not an email address: foo@bar');
  });

  it('creates mailto string correctly', () => {
    const result = createMailto('foo@bar.com', 'hi', 'body');
    expect(result).toBe('mailto:foo@bar.com?subject=hi&body=body');
  });
  it('creates mailto string correctly with only to prop', () => {
    const result = createMailto('foo@bar.com');
    expect(result).toBe('mailto:foo@bar.com?subject=&body=');
  });
});

describe('providerNameToHuman', () => {
  it('decodes hex to string', () => {
    const hex = stringToHex('MyProvider');
    expect(providerNameToHuman({ toString: () => hex })).toBe('MyProvider');
  });
});

describe('getTransactionCost', () => {
  it('returns total cost with additionalCost', async () => {
    const mockExtrinsic = { paymentInfo: vi.fn().mockResolvedValue({ partialFee: { toBigInt: () => 1000n } }) };
    const cost = await getTransactionCost(mockExtrinsic, 'test-address', 500n);
    expect(mockExtrinsic.paymentInfo).toHaveBeenCalledWith('test-address');
    expect(cost).toBe(1500n);
  });
});

describe('checkFundsForExtrinsic', () => {
  const mockApi = { consts: { balances: { existentialDeposit: { toString: () => '100' } } } } as any;
  it('returns transferable when funds are sufficient', async () => {
    const mockExtrinsic = { paymentInfo: vi.fn().mockResolvedValue({ partialFee: { toBigInt: () => 100n } }) };
    user.set({ balances: { total: 2000n } });
    const result = await checkFundsForExtrinsic(mockApi, mockExtrinsic, 'test-address');
    expect(result).toBe(1900n);
    expect(mockExtrinsic.paymentInfo).toHaveBeenCalledWith('test-address');
  });
  it('throws error when funds are insufficient', async () => {
    const mockExtrinsic = { paymentInfo: vi.fn().mockResolvedValue({ partialFee: { toBigInt: () => 5000n } }) };
    user.set({ balances: { total: 2000n } });
    await expect(checkFundsForExtrinsic(mockApi, mockExtrinsic, 'addr')).rejects.toThrow(
      'User does not have sufficient funds.'
    );
  });
  it('handles additionalCost', async () => {
    const mockExtrinsic = { paymentInfo: vi.fn().mockResolvedValue({ partialFee: { toBigInt: () => 100n } }) };
    user.set({ balances: { total: 1000n } });
    const result = await checkFundsForExtrinsic(mockApi, mockExtrinsic, 'addr', 200n);
    expect(result).toBe(900n);
  });
});
describe('checkCapacityForExtrinsic', () => {
  let mockApi: any;
  let mockExtrinsic: any;
  let mockTransaction: any;
  let mockKeyringPair: any;
  let mockAccount: any;
  beforeEach(() => {
    mockTransaction = { signAsync: vi.fn().mockResolvedValue(undefined), toHex: vi.fn().mockReturnValue('0xdeadbeef') };
    mockExtrinsic = { fake: 'extrinsic' };
    mockKeyringPair = { address: '5FAKE' };
    mockAccount = { msaId: 123 };
    mockApi = {
      tx: { frequencyTxPayment: { payWithCapacity: vi.fn().mockReturnValue(mockTransaction) } },
      rpc: {
        frequencyTxPayment: {
          computeCapacityFeeDetails: vi.fn().mockResolvedValue({
            inclusionFee: {
              unwrap: () => ({
                baseFee: { toNumber: () => 100 },
                lenFee: { toNumber: () => 200 },
                adjustedWeightFee: { toNumber: () => 300 },
              }),
            },
          }),
        },
      },
      query: { capacity: { capacityLedger: vi.fn() } },
    };
  });
  it('returns true if transferable > estimated cost', async () => {
    const mockLedger = { isSome: true, unwrap: () => ({ remainingCapacity: { toBigInt: () => 1000n } }) };
    mockApi.query.capacity.capacityLedger.mockResolvedValue(mockLedger);
    const result = await checkCapacityForExtrinsic(mockApi, mockExtrinsic, mockAccount, mockKeyringPair);
    expect(result).toBe(true);
    expect(mockApi.tx.frequencyTxPayment.payWithCapacity).toHaveBeenCalledWith(mockExtrinsic);
    expect(mockTransaction.signAsync).toHaveBeenCalledWith(mockKeyringPair);
    expect(mockApi.rpc.frequencyTxPayment.computeCapacityFeeDetails).toHaveBeenCalledWith('0xdeadbeef', null);
  });
  it('returns false if transferable < estimated cost', async () => {
    const mockLedger = { isSome: true, unwrap: () => ({ remainingCapacity: { toBigInt: () => 100n } }) };
    mockApi.query.capacity.capacityLedger.mockResolvedValue(mockLedger);
    const result = await checkCapacityForExtrinsic(mockApi, mockExtrinsic, mockAccount, mockKeyringPair);
    expect(result).toBe(false);
  });
  it('returns false if no capacity ledger found', async () => {
    const mockLedger = { isSome: false };
    mockApi.query.capacity.capacityLedger.mockResolvedValue(mockLedger);
    const result = await checkCapacityForExtrinsic(mockApi, mockExtrinsic, mockAccount, mockKeyringPair);
    expect(result).toBe(false);
  });
});

describe('getExtension', () => {
  const account = { injectedAccount: { meta: { source: 'polkadot-js' } } } as any;

  beforeEach(() => vi.resetAllMocks());

  it('returns extension when available', async () => {
    vi.mocked(web3Enable).mockResolvedValue([{} as any]);
    const fakeExtension = { signer: {} } as any;
    vi.mocked(web3FromSource).mockResolvedValue(fakeExtension);

    const result = await getExtension(account);
    expect(result).toBe(fakeExtension);
  });

  it('returns undefined if no extensions', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(web3Enable).mockResolvedValue([]);
    const result = await getExtension(account);
    expect(result).toBeUndefined();
    spy.mockRestore();
  });

  it('returns undefined if error getting extension', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(web3Enable).mockRejectedValueOnce(new Error('failure'));
    const result = await getExtension(account);
    expect(result).toBeUndefined();
    spy.mockRestore();
  });
});

describe('subscribeToAccounts', () => {
  const mockNetwork = { genesisHash: '0x123' } as any;
  const fakeApi = {} as any;

  beforeEach(() => vi.clearAllMocks());

  it('adds matching accounts and calls refreshAllBalances', async () => {
    vi.mocked(getBalances).mockImplementation(async (fakeApi, address) => {
      return {
        transferable: 100n,
        locked: 50n,
        total: 150n,
      };
    });

    vi.mocked(getMsaInfoForPublicKey).mockImplementation(async (cb) => {
      return { isProvider: true, msaId: 1234, providerName: 'MyProvider' };
    });

    const accountsFromWallet = [
      { address: 'addr1', meta: { name: 'Alice', genesisHash: '0x123' } },
      { address: 'addr2', meta: { name: 'Bob', genesisHash: '0x456' } },
    ] as any;

    vi.mocked(web3AccountsSubscribe).mockImplementation(async (cb) => {
      await cb(accountsFromWallet);
      return vi.fn();
    });

    await subscribeToAccounts(mockNetwork, fakeApi);

    const updatedMap = (allAccountsStore.set as any).mock.calls[0][0] as Map<string, any>;

    expect(updatedMap.size).toBe(1);
    expect(updatedMap.get('addr1').display).toBe('Alice');
    expect(updatedMap.get('addr1').msaId).toBe(1234);
    expect(updatedMap.get('addr1').isProvider).toBe(true);
  });
});

describe('selectNetworkOptions', () => {
  it('returns correct label and value for normal networks', () => {
    const networks = [
      { id: NetworkType.MAINNET, name: 'MainNet', endpoint: 'wss://mainnet.node/' },
      { id: NetworkType.TESTNET_PASEO, name: 'TestNet', endpoint: 'wss://testnet.node/' },
    ];

    const result = selectNetworkOptions(networks as any);

    expect(result).toEqual([
      { label: 'MainNet: wss://mainnet.node', value: 'MainNet' },
      { label: 'TestNet: wss://testnet.node', value: 'TestNet' },
    ]);
  });

  it('uses only the network name for CUSTOM networks', () => {
    const networks = [{ id: NetworkType.CUSTOM, name: 'CustomNet', endpoint: 'wss://custom.node/' }];

    const result = selectNetworkOptions(networks as any);

    expect(result).toEqual([{ label: 'CustomNet', value: 'CustomNet' }]);
  });

  it('handles missing name or endpoint gracefully', () => {
    const networks = [{ id: NetworkType.MAINNET } as any, { id: NetworkType.TESTNET_PASEO, name: 'TestNet' } as any];

    const result = selectNetworkOptions(networks);

    expect(result).toEqual([
      { label: ': ', value: undefined },
      { label: 'TestNet: ', value: 'TestNet' },
    ]);
  });
});
