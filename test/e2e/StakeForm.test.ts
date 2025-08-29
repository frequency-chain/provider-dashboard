import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { Mock, vi } from 'vitest';

// 👇 mocks must come first
vi.mock('$lib/connections', () => ({
  submitStake: vi.fn(),
  DOLLARS: 1n,
}));

vi.mock('$lib/utils', () => ({
  selectAccountOptions: vi.fn(),
  getExtension: vi.fn().mockResolvedValue({ signer: {} }),
}));

import StakeForm from '../../src/components/features/Capacity/StakeForm.svelte';
import { submitStake } from '../../src/lib/connections'; // must match component import
import { dotApi } from '../../src/lib/stores';
import { allAccountsStore } from '../../src/lib/stores/accountsStore';
import { user } from '../../src/lib/stores/userStore';
import { selectAccountOptions } from '../../src/lib/utils';

vi.mock('$lib/utils', () => ({
  selectAccountOptions: vi.fn(),
  getExtension: vi.fn().mockResolvedValue({ signer: {} }),
}));

dotApi.set({ api: {} } as any);

const mockAccount = {
  address: '0x1234',
  msaId: 123,
  isProvider: true,
  balances: { transferable: 100n, locked: 10n, total: 110n },
};

describe('StakeForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    user.set({
      msaId: 123,
      isProvider: true,
      address: '0x1234',
      balances: { transferable: 100n, locked: 10n, total: 110n },
    });
    allAccountsStore.set(new Map([[mockAccount.address, mockAccount]]));
  });

  it('renders form elements', () => {
    render(StakeForm, { modalOpen: true });

    expect(screen.getByText(/Wallet Control Key/i)).toBeDefined();
    expect(screen.getByText(/Amount/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Stake/i })).toBeDefined();
  });

  it('shows error if no account selected', async () => {
    render(StakeForm, { modalOpen: true });

    const button = screen.getByRole('button', { name: /Stake/i });
    await fireEvent.click(button);

    expect(await screen.findByText(/Account not selected/i)).toBeInTheDocument();
  });

  it('calls submitStake when valid', async () => {
    // Mock account options
    (selectAccountOptions as Mock).mockReturnValue([{ optionLabel: 'test option', value: mockAccount.address }]);

    const { container } = render(StakeForm, { modalOpen: true });

    // Select the account
    const select = screen.getByText(/Select Control Key/i);
    await fireEvent.click(select);

    const option = screen.getByText(/test option/i);
    await fireEvent.click(option);
    console.log('ACCOUNT SELECTED');

    // Type the stake amount
    const input = screen.getByTestId('staking-input');
    expect(input).toBeDefined();

    (input as HTMLInputElement).value = '5';
    await fireEvent.input(input);
    console.log('INPUT VALUE SET');

    // Click the stake button
    const button = screen.getByRole('button', { name: /Stake/i });
    await fireEvent.click(button);
    console.log('SUBMITTED');

    // Assert loading icon shows
    await waitFor(() => {
      expect(screen.getByTestId('loading-icon')).toBeDefined();
    });

    await waitFor(() => {
      expect(submitStake).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  // it('handles error from submitStake', async () => {
  //   (submitStake as any).mockRejectedValue(new Error('Stake failed'));

  //   render(StakeForm, { modalOpen: true });

  //   const select = screen.getByLabelText(/Wallet Control Key/i);
  //   await fireEvent.change(select, { target: { value: mockAccount.address } });

  //   const button = screen.getByRole('button', { name: /Stake/i });
  //   await fireEvent.click(button);

  //   expect(await screen.findByText(/Stake failed/i)).toBeInTheDocument();
  // });
});
