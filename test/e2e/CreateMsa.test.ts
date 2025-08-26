// CreateMsa.test.ts
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import { writableActivityLog } from '../../src/lib/stores/activityLogStore';
import { user } from '../../src/lib/stores/userStore';

vi.mock('$lib/connections', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/connections')>('../../src/lib/connections');
  return {
    ...actual,
    submitCreateMsa: vi.fn(),
  };
});

import CreateMsa from '../../src/components/features/BecomeProviderNextSteps/CreateMsa.svelte';
import { submitCreateMsa } from '../../src/lib/connections';
import { TxnStatus } from '../../src/lib/storeTypes';

vi.mock('$lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/utils')>('../../src/lib/utils');
  return {
    ...actual,
    getExtension: actual.getExtension,
    cn: actual.cn,
  };
});

describe('CreateMsa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writableActivityLog.set([]);
    user.set({ address: '0x123', msaId: null });
  });

  it('renders with heading and description', () => {
    render(CreateMsa, { isLoading: false });

    expect(screen.getByText('Create MSA Id')).toBeDefined();
    expect(screen.getByText(/An MSA \(Message Source Account\) is required/)).toBeDefined();
    expect(screen.getByRole('button', { name: /Create an MSA/i })).toBeDefined();
  });

  it('disables button and shows loading icon when loading', async () => {
    render(CreateMsa, { isLoading: true });

    const btn = screen.getByRole('button');
    // should have disabled styling
    expect(btn).toMatchSnapshot();
    expect(screen.getByTestId('loading-icon')).toBeDefined();
  });

  it('calls submitCreateMsa on click', async () => {
    render(CreateMsa);
    const btn = screen.getByRole('button', { name: /Create an MSA/i });

    await fireEvent.click(btn);

    await waitFor(() => {
      expect(submitCreateMsa).toHaveBeenCalled();
      expect(screen.getByTestId('loading-icon')).toBeDefined();
    });
  });

  it('shows error message if submitCreateMsa throws', async () => {
    (submitCreateMsa as jest.Mock).mockRejectedValueOnce(new Error('test error'));

    render(CreateMsa);

    const btn = screen.getByRole('button', { name: /Create an MSA/i });
    await fireEvent.click(btn);

    expect(await screen.findByText('test error')).toBeDefined();
  });

  it('renders ActivityLogPreviewItem if recentActivityItem exists', async () => {
    writableActivityLog.set([{ txnId: 'txn-123', txnStatus: TxnStatus.SUCCESS }]);

    render(CreateMsa);

    await fireEvent.click(screen.getByRole('button', { name: /Create an MSA/i }));
    (submitCreateMsa as jest.Mock).mockRejectedValueOnce('0x123456');

    console.log('***screen', screen);

    expect(await screen.findByText(/Hash:/i)).toBeDefined();
  });
});
