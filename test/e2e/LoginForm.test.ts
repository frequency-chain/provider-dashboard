import { user } from '$lib/stores/userStore';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { writable } from 'svelte/store';
import { vi } from 'vitest';
import LoginForm from '../../src/components/features/LoginForm/LoginForm.svelte';
import { type Account, allAccountsStore } from '../../src/lib/stores/accountsStore';
import { clearLog } from '../../src/lib/stores/activityLogStore';

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

vi.mock('$lib/stores/activityLogStore', () => ({
  clearLog: vi.fn(),
}));

vi.mock('$lib/utils', async () => {
  const actual = await vi.importActual<typeof import('$lib/utils')>('$lib/utils');

  return {
    ...actual,
    connectAndFetchAccounts: vi.fn().mockImplementation(async () => {
      allAccountsStore.set(new Map([[mockAccount.address, mockAccount]]));
    }),
    isValidURL: () => false,
  };
});

vi.mock('$lib/stores/networksStore', async () => {
  const actual = await vi.importActual<typeof import('$lib/stores/networksStore')>('$lib/stores/networksStore');

  const NetworkType = { CUSTOM: 'custom', TESTNET: 'testnet' };

  return {
    ...actual,
    allNetworks: writable([{ id: 'testnet', name: 'testnet', endpoint: 'wss://test1.node', type: 'testnet' }]),
    NetworkType,
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    allAccountsStore.set(new Map([[mockAccount.address, mockAccount]]));
    user.set({ ...mockAccount });
  });

  it('renders the select and buttons', () => {
    render(LoginForm, { modalOpen: true });

    expect(screen.getAllByText(/Select a Provider Control Key/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Connect to Account/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDefined();
  });

  it('disables connect button when canConnect is false', async () => {
    // make account invalid
    allAccountsStore.set(new Map());
    await tick();

    render(LoginForm);

    const connectButton = screen.getByRole('button', { name: /Connect to Account/i });
    expect(connectButton).toBeDisabled();
  });

  it('calls connect and updates user when valid', async () => {
    render(LoginForm);

    const connectButton = screen.getByRole('button', { name: /Connect to Account/i });
    await waitFor(() => expect(connectButton).not.toBeDisabled());
    await fireEvent.click(connectButton);

    expect(clearLog).toHaveBeenCalled();
  });

  it('calls alert when no newUser is available', async () => {
    user.set({ ...user, address: '' });

    const alertMock = vi.fn();
    vi.stubGlobal('alert', alertMock);

    render(LoginForm);

    const button = screen.getByRole('button', { name: /connect to account/i });
    await fireEvent.click(button);

    expect(alertMock).toHaveBeenCalledWith('Invalid form values');
  });

  // it('closes modal on connect', async () => {
  //   const modalOpen = writable(true);

  //   const { component } = render(LoginForm, { modalOpen });

  //   console.log(component);

  //   const button = screen.getByRole('button', { name: /connect to account/i });
  //   await fireEvent.click(button);

  //   let latest: boolean | null;
  //   modalOpen.subscribe((v) => (latest = v))();

  //   await waitFor(() => expect(latest).toBe(false));
  // });
});
