import { fireEvent, render, screen } from '@testing-library/svelte';
import { Mock, vi } from 'vitest';

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
import { getExtension, selectAccountOptions } from '../../src/lib/utils';

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
    user.set(mockAccount);
    allAccountsStore.set(new Map([[mockAccount.address, mockAccount]]));
    (getExtension as Mock).mockResolvedValue({ signer: {} });
    (submitStake as Mock).mockResolvedValue(undefined);
    (selectAccountOptions as Mock).mockReturnValue([{ label: 'test option', value: mockAccount.address }]);
  });

  it('renders form elements', () => {
    render(StakeForm, { modalOpen: true });

    expect(screen.getByText(/Wallet Control Key/i)).toBeDefined();
    expect(screen.getByText(/Amount/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Stake/i })).toBeDefined();
  });

  it('is disabled no account selected', async () => {
    render(StakeForm, { modalOpen: true });

    const button = screen.getByRole('button', { name: /Stake/i });
    expect(button).toBeDisabled();
  });

  // TODO: fix this test
  // it('calls submitStake when valid', async () => {
  //   (selectAccountOptions as Mock).mockReturnValue([{ label: 'test option', value: mockAccount.address }]);

  //   render(StakeForm, { modalOpen: true });

  //   // Select the account
  //   const select = screen.getByText(/Select Control Key/i);
  //   await fireEvent.click(select);

  //   const option = screen.getByText(/test option/i);
  //   await fireEvent.click(option);

  //   // Type the stake amount
  //   const input = screen.getByTestId('staking-input');
  //   expect(input).toBeDefined();

  //   (input as HTMLInputElement).value = '5';
  //   await fireEvent.input(input);

  //   const button = screen.getByRole('button', { name: /Stake/i });
  //   fireEvent.click(button);

  //   expect(screen.getByTestId('loading-icon')).toBeDefined();

  //   waitFor(() => {
  //     expect(submitStake).toHaveBeenCalledWith({}, { signer: {} }, mockAccount, mockAccount.msaId, 5n);
  //   });
  // });

  // TODO: fix this test
  // it('handles error when stakeAmount = 0n', async () => {
  //   (selectAccountOptions as Mock).mockReturnValue([{ label: 'test option', value: mockAccount.address }]);

  //   const { container } = render(StakeForm, { modalOpen: true });

  //   // Select the account
  //   const trigger = container.querySelector('#stake-using-account-id');
  //   if (!trigger) throw new Error('Select not found');
  //   await fireEvent.click(trigger);

  //   const option = screen.getByText(/test option/i);
  //   await fireEvent.click(option);

  //   // Type the stake amount
  //   const input = screen.getByTestId('staking-input');
  //   expect(input).toBeDefined();

  //   (input as HTMLInputElement).value = '';
  //   await fireEvent.input(input);

  //   const button = screen.getByRole('button', { name: /Stake/i });
  //   await fireEvent.click(button);

  //   await waitFor(async () => {
  //     expect(submitStake).toHaveBeenCalledWith({}, { signer: {} }, mockAccount, mockAccount.msaId, 0n);
  //   });
  // });

  it('shows error when msaId is undefined', async () => {
    user.set({ ...mockAccount, msaId: undefined });

    render(StakeForm, { modalOpen: true });

    const button = screen.getByRole('button', { name: /Stake/i });
    await fireEvent.click(button);

    expect(await screen.findByText(/Undefined MSA ID/i)).toBeInTheDocument();
    expect(submitStake).not.toHaveBeenCalled();
  });

  it('shows error when msaId is 0', async () => {
    user.set({ ...mockAccount, msaId: 0 });

    render(StakeForm, { modalOpen: true });

    const button = screen.getByRole('button', { name: /Stake/i });
    await fireEvent.click(button);

    expect(await screen.findByText(/Undefined MSA ID/i)).toBeInTheDocument();
    expect(submitStake).not.toHaveBeenCalled();
  });
});
