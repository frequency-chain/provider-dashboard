import { ExtrinsicStatus } from '@polkadot/types/interfaces';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { Mock, vi } from 'vitest';
import RequestToBeProvider from '../../src//components/features/BecomeProviderNextSteps/RequestToBeProvider.svelte';
import { submitRequestToBeProvider } from '../../src/lib/connections';
import { getMsaInfo } from '../../src/lib/polkadotApi';
import { dotApi } from '../../src/lib/stores';
import { handleResult } from '../../src/lib/stores/activityLogStore';
import { user } from '../../src/lib/stores/userStore';
import { createMockSubmittableResult } from '../helpers';

vi.mock('$lib/connections', () => ({
  submitRequestToBeProvider: vi.fn(),
}));

vi.mock('$lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/utils')>('../../src/lib/utils');
  return {
    ...actual,
    getExtension: vi.fn().mockResolvedValue('mockExtension'),
    providerNameToHuman: vi.fn((x) => x),
  };
});

vi.mock('$lib/polkadotApi', () => ({
  getMsaInfo: vi.fn().mockResolvedValue({ providerName: 'TestProvider', isProvider: true }),
}));

describe('RequestToBeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dotApi.set({ api: {} as any });
    user.set({ address: '0x1234', msaId: 1234, network: { endpoint: 'ws://test' } });
  });

  it('renders form when hasRequestedToBeProvider=false', () => {
    render(RequestToBeProvider, { hasRequestedToBeProvider: false });
    expect(screen.getByLabelText(/Provider name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request To Be Provider/i })).toBeDisabled();
  });

  it('enables button when input has value', async () => {
    render(RequestToBeProvider, { hasRequestedToBeProvider: false });
    const input = screen.getByLabelText(/Provider name/i);
    await fireEvent.input(input, { target: { value: 'MyProvider' } });
    expect(screen.getByRole('button', { name: /Request To Be Provider/i })).toBeEnabled();
  });

  it('alerts if dotApi.api missing', async () => {
    dotApi.set({ api: undefined });

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(RequestToBeProvider, { hasRequestedToBeProvider: false });

    const btn = screen.getByRole('button', { name: /Request To Be Provider/i });
    await fireEvent.click(btn);

    expect(alertMock).toHaveBeenCalledWith('please reconnect to an endpoint');
  });

  it('submits request with user + provider name', async () => {
    const txnId = 'txn123';

    (submitRequestToBeProvider as any).mockResolvedValueOnce(txnId);
    render(RequestToBeProvider, { hasRequestedToBeProvider: false });

    const input = screen.getByLabelText(/Provider name/i);
    await fireEvent.input(input, { target: { value: 'Alice' } });

    const btn = screen.getByRole('button', { name: /Request To Be Provider/i });
    await fireEvent.click(btn);

    await waitFor(() => {
      expect(submitRequestToBeProvider).toHaveBeenCalledWith(
        expect.any(Object), // api
        'mockExtension',
        expect.objectContaining({ address: '0x1234' }),
        'Alice'
      );
    });

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
      expect(getMsaInfo).toHaveBeenCalled();
    });
  });

  it('shows success message when hasRequestedToBeProvider=true', () => {
    render(RequestToBeProvider, { hasRequestedToBeProvider: true });
    expect(screen.getByText(/Success! Your request/)).toBeInTheDocument();
    expect(screen.getByText(/MSA ID:/)).toBeInTheDocument();
  });

  it('shows failure message when txn status=FAILURE', async () => {
    const txnId = 'txn123';

    (submitRequestToBeProvider as Mock).mockResolvedValueOnce(txnId);
    render(RequestToBeProvider, { hasRequestedToBeProvider: false });

    const input = screen.getByLabelText(/Provider name/i);
    await fireEvent.input(input, { target: { value: 'Alice' } });

    const btn = screen.getByRole('button', { name: /Request To Be Provider/i });
    await fireEvent.click(btn);

    await waitFor(() => {
      expect(submitRequestToBeProvider).toHaveBeenCalledWith(
        expect.any(Object), // api
        'mockExtension',
        expect.objectContaining({ address: '0x1234' }),
        'Alice'
      );
    });

    const mockResult = createMockSubmittableResult({
      txHash: { toString: () => txnId } as any,
      status: {
        isFinalized: true,
        asFinalized: { toHex: () => null },
        toString: () => 'Finalized',
        isError: true,
      } as unknown as ExtrinsicStatus,
      isFinalized: true,
      isInBlock: false,
      events: [{ event: { section: 'system', method: 'ExtrinsicFailed', data: [] } } as any],
    });

    handleResult(mockResult);

    await waitFor(() => {
      expect(getMsaInfo).toHaveBeenCalled();
    });

    expect(await screen.findByText(/Your request to has failed/i)).toBeInTheDocument();
  });
});
