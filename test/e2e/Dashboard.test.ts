import type { ApiPromise } from '@polkadot/api';
import { render, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { vi } from 'vitest';
import Dashboard from '../../src/components/pages/Dashboard.svelte';
import { fetchAccountsForNetwork } from '../../src/lib/stores/accountsStore';

vi.mock('$lib/stores/userStore', () => ({
  user: writable({
    network: { endpoint: 'ws://test' },
    address: '5abc',
  }),
}));

vi.mock('$lib/stores/accountsStore', () => ({
  fetchAccountsForNetwork: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('$lib/stores', () => ({
  dotApi: writable({ api: {} as ApiPromise }),
}));

vi.mock('$features/ProfileOverview/ProfileOverview.svelte', () => ({ default: vi.fn() }));
vi.mock('$features/ChainStatus/ChainStatus.svelte', () => ({ default: vi.fn() }));
vi.mock('$features/Provider/Provider.svelte', () => ({ default: vi.fn() }));
vi.mock('$features/Capacity/Capacity.svelte', () => ({ default: vi.fn() }));

const web3EnableMock = vi.fn().mockResolvedValue(['test-extension']);
const web3AccountsMock = vi.fn().mockResolvedValue([{ address: '5abc' }]);

vi.mock('@polkadot/extension-dapp', () => ({
  __esModule: true,
  web3Enable: web3EnableMock,
  web3Accounts: web3AccountsMock,
}));

describe('Dashboard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard container', () => {
    render(Dashboard);
    expect(document.getElementById('dashboard')).toBeInTheDocument();
  });

  // it('triggers fetchAccountsForNetwork when network and extension exist', async () => {
  //   render(Dashboard);

  //   await waitFor(() => {
  //     expect(fetchAccountsForNetwork).toHaveBeenCalledWith(
  //       { endpoint: 'ws://test' },
  //       web3EnableMock,
  //       web3AccountsMock,
  //       {} as ApiPromise
  //     );
  //   });
  // });
});
