import { ExtrinsicStatus, Hash } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { Mock, vi } from 'vitest';
import CreateMsa from '../../src/components/features/BecomeProviderNextSteps/CreateMsa.svelte';
import { submitCreateMsa } from '../../src/lib/connections';
import { handleResult } from '../../src/lib/stores/activityLogStore';
import { user } from '../../src/lib/stores/userStore';

vi.mock('$lib/connections', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/connections')>('../../src/lib/connections');
  return {
    ...actual,
    submitCreateMsa: vi.fn(),
  };
});

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

  it('sets isLoading = false if transaction did not succeed', async () => {
    const mockSubmit = vi.fn().mockImplementation(async (_: any, callback: (succeeded: boolean) => void) => {
      callback(false);
    });

    render(CreateMsa, { submitCreateMsa: mockSubmit });

    const btn = screen.getByRole('button', { name: /Create an MSA/i });
    await fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-icon')).toBeNull();
    });

    expect(get(user).msaId).toBeNull();
  });

  it('shows error message if submitCreateMsa throws', async () => {
    (submitCreateMsa as Mock).mockRejectedValueOnce(new Error('test error'));

    render(CreateMsa);

    const btn = screen.getByRole('button', { name: /Create an MSA/i });
    await fireEvent.click(btn);

    expect(await screen.findByText('test error')).toBeDefined();
  });

  it('renders ActivityLogPreviewItem after submitCreateMsa', async () => {
    const txnId = 'txn-123';

    // Mock the submitCreateMsa call
    (submitCreateMsa as Mock).mockResolvedValueOnce(txnId);

    render(CreateMsa);

    // Click the "Create an MSA" button
    const btn = screen.getByRole('button', { name: /Create an MSA/i });
    await fireEvent.click(btn);

    // Create a fully finalized mock result
    const mockResult = createMockSubmittableResult({
      txHash: { toString: () => txnId } as any,
      status: {
        isFinalized: true,
        asFinalized: { toHex: () => '0x123456' },
        toString: () => 'Finalized',
      } as unknown as ExtrinsicStatus,
      isFinalized: true,
      isInBlock: false,
      events: [{ event: { section: 'system', method: 'ExtrinsicSuccess', data: [] } } as any],
    });

    handleResult(mockResult);

    await tick();

    await waitFor(() => {
      expect(screen.getByText(/Transaction succeeded/i)).toBeDefined();
      expect(screen.getByText(/0x123456/)).toBeDefined(); // or match the exact rendered message
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-icon')).toBeNull();
    });
  });
});

export function createMockSubmittableResult(overrides: Partial<ISubmittableResult> = {}): ISubmittableResult {
  // Default status is finalized
  const defaultStatus: ExtrinsicStatus = {
    isInBlock: false,
    isFinalized: true,
    isBroadcast: false,
    isInvalid: false,
    isUsurped: false,
    asFinalized: { toHex: () => '0x123456' } as any,
    asInBlock: { toHex: () => '0x0' } as any,
    toString: () => 'Finalized',
  } as unknown as ExtrinsicStatus;

  const defaultTxHash: Hash = u8aToHex(new Uint8Array(32)) as unknown as Hash;

  return {
    dispatchError: undefined,
    dispatchInfo: undefined,
    internalError: undefined,
    events: [],
    status: defaultStatus,
    isCompleted: true,
    isError: false,
    isFinalized: true,
    isInBlock: false,
    isWarning: false,
    txHash: defaultTxHash,
    txIndex: 0,
    filterRecords: (_section: string, _method: string) => [],
    findRecord: (_section: string, _method: string) => undefined,
    toHuman: (_isExtended?: boolean) => ({}),
    ...overrides,
  } as ISubmittableResult;
}
