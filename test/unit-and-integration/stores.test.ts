import { createApi } from '$lib/polkadotApi';
import { dotApi, isLoggedIn, storeChainInfo } from '$lib/stores';
import { pageContent } from '$lib/stores/pageContentStore';
import { user } from '$lib/stores/userStore';
import { defaultDotApi } from '$lib/storeTypes';
import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logInPromise, logout } from '../../src/lib/stores';
import { clearLog } from '../../src/lib/stores/activityLogStore';

vi.mock('$lib/polkadotApi', () => ({
  createApi: vi.fn().mockResolvedValue({ fake: 'api' }),
}));

vi.mock('$lib/stores/pageContentStore', () => ({
  pageContent: {
    dashboard: vi.fn(),
    login: vi.fn(),
  },
}));

vi.mock('$lib/stores/activityLogStore', () => ({
  clearLog: vi.fn(),
}));

describe('stores module', () => {
  beforeEach(() => {
    dotApi.set(defaultDotApi);
    isLoggedIn.set(false);
    storeChainInfo.set({
      connected: false,
      blockNumber: 0n,
      epochNumber: 0n,
      token: '',
    });
    user.set({ address: '', isProvider: false, balances: { transferable: 0n, locked: 0n, total: 0n } });

    vi.clearAllMocks();
  });

  it('has correct initial states', () => {
    expect(get(dotApi)).toEqual(defaultDotApi);
    expect(get(isLoggedIn)).toBe(false);
    expect(get(storeChainInfo)).toEqual({
      connected: false,
      blockNumber: 0n,
      epochNumber: 0n,
      token: '',
    });
  });

  it('logInPromise sets dotApi and isLoggedIn when user is provider', async () => {
    user.set({
      address: 'addr1',
      isProvider: true,
      network: { endpoint: 'ws://test' },
      balances: { transferable: 0n, locked: 0n, total: 0n },
    });

    await get(logInPromise);

    expect(createApi).toHaveBeenCalledWith('ws://test');
    expect(get(dotApi)).toEqual({ fake: 'api' });
    expect(get(isLoggedIn)).toBe(true);
    expect(pageContent.dashboard).toHaveBeenCalled();
  });

  it('logInPromise does nothing if user has no endpoint', async () => {
    user.set({
      address: 'addr2',
      isProvider: true,
      network: null,
      balances: { transferable: 0n, locked: 0n, total: 0n },
    });

    await get(logInPromise);

    expect(createApi).not.toHaveBeenCalled();
    expect(get(dotApi)).toEqual(defaultDotApi);
    expect(get(isLoggedIn)).toBe(false);
  });

  it('logout resets state and calls clearLog + pageContent.login', async () => {
    dotApi.set({ fake: 'api' } as any);
    isLoggedIn.set(true);
    storeChainInfo.set({ connected: true, blockNumber: 123n, epochNumber: 5n, token: 'DOT' });

    logout();

    expect(get(dotApi)).toEqual(defaultDotApi);
    expect(get(isLoggedIn)).toBe(false);
    expect(get(storeChainInfo)).toEqual({
      connected: false,
      blockNumber: 0n,
      epochNumber: 0n,
      token: '',
    });
    expect(clearLog).toHaveBeenCalled();
    expect(pageContent.login).toHaveBeenCalled();
  });
});
