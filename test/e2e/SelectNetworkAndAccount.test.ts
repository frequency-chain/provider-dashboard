// ConnectAndFetchAccounts.test.ts
import { InjectedAccount, InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';
import { render } from '@testing-library/svelte';
import { Mock, describe, expect, it, vi } from 'vitest';
import SelectNetworkAndAccount from '../../src/components/features/SelectNetworkAndAccount/SelectNetworkAndAccount.svelte';
import { createApi } from '../../src/lib/polkadotApi';
import { Account, allAccountsStore } from '../../src/lib/stores/accountsStore';
import { NetworkInfo, NetworkType } from '../../src/lib/stores/networksStore';
import { user } from '../../src/lib/stores/userStore';
import { connectAndFetchAccounts } from '../../src/lib/utils';

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

describe('SelectNetworkAndAccount', () => {
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

  const mockWeb3Enable: () => Promise<InjectedExtension[]> = vi.fn().mockResolvedValue([
    {
      name: 'polkadot-js',
      version: '0.50.0',
      injector: {
        signer: {} as any,
        accounts: {
          get: vi.fn(async () => [
            { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmto6UXo7B6a', meta: { name: 'Alice' } } as InjectedAccount,
          ]),
          subscribe: vi.fn((cb: (accounts: InjectedAccount[]) => void) => {
            cb([{ address: '5FHneW46xGXgs5mUiveU4sbTyGBzmto6UXo7B6a', meta: { name: 'Alice' } } as InjectedAccount]);
            return () => {};
          }),
        },
      },
    } as unknown as InjectedExtension,
  ]);

  const mockWeb3EnableEmptyAccounts: () => Promise<InjectedExtension[]> = vi.fn().mockResolvedValue([
    {
      name: 'polkadot-js',
      version: '0.50.0',
      injector: {
        signer: {} as any,
        accounts: {
          get: vi.fn(async () => []),
          subscribe: vi.fn((cb: (accounts: InjectedAccount[]) => void) => {
            cb([]);
            return () => {};
          }),
        },
      },
    } as unknown as InjectedExtension,
  ]);

  const mockWeb3Accounts = vi.fn().mockResolvedValue([
    {
      address: '5FHneW46xGXgs5mUiveU4sbTyGBzmto6UXo7B6a',
      meta: { name: 'Alice' },
      type: 'sr25519',
    } as InjectedAccountWithMeta,
    {
      address: '5DAAnrj7VHTz5s9Uo29F9u1ZKx4u3ZtX5kh6p',
      meta: { name: 'Bob' },
      type: 'ed25519',
    } as InjectedAccountWithMeta,
  ]);

  const mockWeb3EmptyAccounts = vi.fn().mockResolvedValue([]);

  beforeEach(() => {
    vi.clearAllMocks();
    allAccountsStore.set(new Map([[mockAccount.address, mockAccount]]));
    user.set({ ...mockAccount });
  });

  it('sets networkErrorMsg when endpoint is missing', async () => {
    render(SelectNetworkAndAccount, {
      props: {
        newUser: null,
        accounts: new Map(),
      },
    });

    // invalid endpoint
    expect(
      connectAndFetchAccounts(
        { id: NetworkType.TESTNET_PASEO, name: 'Testnet', pathName: 'testnet', endpoint: undefined },
        mockWeb3Enable,
        mockWeb3Accounts
      )
    ).rejects.toThrowError('Could not connect to empty value. Please enter a valid and reachable Websocket URL.');
  });

  // it('sets successfully calls createApi and fetchAccountsForNetwork', async () => {
  //   const disconnectMock = vi.fn();
  //   (createApi as unknown as Mock).mockResolvedValue({
  //     api: { disconnect: disconnectMock },
  //   });

  //   render(SelectNetworkAndAccount, {
  //     props: {
  //       newUser: null,
  //       accounts: allAccountsStore,
  //     },
  //   });

  //   // valid endpoint
  //   const validEndpoint: NetworkInfo = {
  //     id: NetworkType.TESTNET_PASEO,
  //     name: 'testnet',
  //     endpoint: 'wss://test1.node',
  //     pathName: 'testnet',
  //   };
  //   await connectAndFetchAccounts(validEndpoint, mockWeb3Enable, mockWeb3Accounts);

  //   await waitFor(() => {
  //     expect(createApi).toBeCalledWith(validEndpoint.endpoint);
  //     expect(fetchAccountsForNetwork).toBeCalled();
  //     expect(disconnectMock).toBeCalled();
  //   });
  // });

  // TODO: fix this test
  it('sets accountErrorMsg when account size is 0', async () => {
    const disconnectMock = vi.fn();
    (createApi as unknown as Mock).mockResolvedValue({
      api: { disconnect: disconnectMock },
    });

    const { container } = render(SelectNetworkAndAccount, {
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

    await connectAndFetchAccounts(validEndpoint, mockWeb3EnableEmptyAccounts, mockWeb3EmptyAccounts);

    // await waitFor(() => {
    //   expect(getByText(container, 'No accounts found.')).toBeDefined();
    // });
  });
});
