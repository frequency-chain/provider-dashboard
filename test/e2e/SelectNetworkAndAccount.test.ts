// ConnectAndFetchAccounts.test.ts
import { getByText, render, waitFor } from '@testing-library/svelte';
import { Mock, describe, expect, it, vi } from 'vitest';
import SelectNetworkAndAccount from '../../src/components/features/SelectNetworkAndAccount/SelectNetworkAndAccount.svelte';
import { createApi } from '../../src/lib/polkadotApi';
import { Account, allAccountsStore, fetchAccountsForNetwork } from '../../src/lib/stores/accountsStore';
import { NetworkInfo, NetworkType } from '../../src/lib/stores/networksStore';
import { user } from '../../src/lib/stores/userStore';

vi.mock('$lib/polkadotApi', () => ({
  createApi: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(import('$lib/stores/accountsStore'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchAccountsForNetwork: vi.fn().mockResolvedValue(undefined),
  };
});

describe('connectAndFetchAccounts', () => {
  const mockAccount: Account = {
    address: '0x123',
    network: {
      id: 'testnet',
      name: 'testnet',
      pathName: 'testnet',
      endpoint: 'wss://test1.node',
    },
    msaId: 1,
    isProvider: true,
    balances: { transferable: 100n, locked: 0n, total: 100n },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    allAccountsStore.set(new Map([[mockAccount.address, mockAccount]]));
    user.set({ ...mockAccount });
  });

  it('sets networkErrorMsg when endpoint is missing', async () => {
    const { container, component } = render(SelectNetworkAndAccount, {
      props: {
        newUser: null,
        accounts: new Map(),
      },
    });

    // invalid endpoint
    await component.connectAndFetchAccounts({ name: 'testnet', endpoint: null });

    expect(
      getByText(container, 'Could not connect to empty value. Please enter a valid and reachable Websocket URL.')
    ).toBeDefined();
  });

  it('sets successfully calls createApi and fetchAccountsForNetwork', async () => {
    const disconnectMock = vi.fn();
    (createApi as unknown as Mock).mockResolvedValue({
      api: { disconnect: disconnectMock },
    });

    const { component } = render(SelectNetworkAndAccount, {
      props: {
        newUser: null,
        accounts: allAccountsStore,
      },
    });

    // valid endpoint
    const validEndpoint: NetworkInfo = {
      id: NetworkType.TESTNET_PASEO,
      name: 'testnet',
      endpoint: 'wss://test1.node',
      pathName: 'testnet',
    };
    await component.connectAndFetchAccounts(validEndpoint);

    await waitFor(() => {
      expect(createApi).toBeCalledWith(validEndpoint.endpoint);
      expect(fetchAccountsForNetwork).toBeCalled();
      expect(disconnectMock).toBeCalled();
    });
  });

  it('sets accountErrorMsg when account size is 0', async () => {
    const disconnectMock = vi.fn();
    (createApi as unknown as Mock).mockResolvedValue({
      api: { disconnect: disconnectMock },
    });

    const { container, component } = render(SelectNetworkAndAccount, {
      props: {
        newUser: null,
        accounts: new Map(),
      },
    });

    // valid endpoint
    const validEndpoint: NetworkInfo = {
      id: NetworkType.TESTNET_PASEO,
      name: 'testnet',
      endpoint: 'wss://test1.node',
      pathName: 'testnet',
    };
    await component.connectAndFetchAccounts(validEndpoint);

    expect(getByText(container, 'No accounts found.')).toBeDefined();
  });
});
