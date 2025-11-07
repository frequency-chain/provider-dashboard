import { goto } from '$app/navigation';
import { ExtrinsicStatus } from '@polkadot/types/interfaces';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { writable } from 'svelte/store';
import { Mock, vi } from 'vitest';
import CreateProvider from '../../src/components/features/BecomeProviderNextSteps/CreateProvider.svelte';
import { submitCreateProvider } from '../../src/lib/connections';
import { getMsaInfoForPublicKey } from '../../src/lib/polkadotApi';
import { dotApi } from '../../src/lib/stores';
import { handleResult } from '../../src/lib/stores/activityLogStore';
import { user } from '../../src/lib/stores/userStore';
import { createMockSubmittableResult } from '../helpers';

vi.mock('$lib/connections', () => ({
  submitCreateProvider: vi.fn().mockResolvedValue('mock-txn-id'),
}));

vi.mock('$lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/utils')>('../../src/lib/utils');
  return {
    ...actual,
    getExtension: vi.fn().mockResolvedValue({ signer: {} }),
    providerNameToHuman: vi.fn((name: string) => name),
    cn: actual.cn,
  };
});

vi.mock('$lib/polkadotApi', () => ({
  getMsaInfoForPublicKey: vi.fn().mockResolvedValue({ providerName: 'TestProvider', isProvider: true }),
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
}));

vi.mock('$lib/stores', () => ({
  dotApi: writable({ api: {} }),
  logout: vi.fn(),
}));

vi.mock('$lib/stores/userStore', () => ({
  user: writable({
    address: '0x1234',
    network: { endpoint: 'ws://test' },
    msaId: 1234,
  }),
}));

describe('CreateProvider component', () => {
  let alertMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders input and button', () => {
    render(CreateProvider, { isLoading: false });
    expect(screen.getByLabelText(/Provider name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create provider/i })).toBeInTheDocument();
  });

  it('disables button when no provider name', async () => {
    render(CreateProvider, { isLoading: false });
    const btn = screen.getByRole('button', { name: /create provider/i });
    expect(btn).toBeDisabled();
  });

  it('enables button when input has value', async () => {
    render(CreateProvider, { isLoading: false });
    const input = screen.getByLabelText(/Provider name/i);
    await fireEvent.input(input, { target: { value: 'Alice' } });
    const btn = screen.getByRole('button', { name: /create provider/i });
    expect(btn).not.toBeDisabled();
  });

  it('calls submitCreateProvider on click with valid input, successfully navs to /', async () => {
    render(CreateProvider, { isLoading: false });

    const txnId = 'txn123';

    (submitCreateProvider as Mock).mockResolvedValueOnce(txnId);
    (getMsaInfoForPublicKey as Mock).mockResolvedValueOnce({
      isProvider: true,
      msaId: 1234,
      providerName: 'Alice',
    });

    const input = screen.getByLabelText(/Provider name/i);
    await fireEvent.input(input, { target: { value: 'Alice' } });

    const btn = screen.getByRole('button', { name: /create provider/i });
    await fireEvent.click(btn);

    await waitFor(() => {
      expect(submitCreateProvider).toHaveBeenCalled();
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
      expect(getMsaInfoForPublicKey).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(goto).toHaveBeenCalledWith('/');
    });
  });

  it('calls submitCreateProvider on click with invalid input, displays error', async () => {
    render(CreateProvider, { isLoading: false });

    const errorMsg = 'Submission failed';

    (submitCreateProvider as Mock).mockRejectedValueOnce(new Error(errorMsg));
    (getMsaInfoForPublicKey as Mock).mockResolvedValueOnce({
      isProvider: true,
      msaId: 1234,
      providerName: 'Alice',
    });

    const input = screen.getByLabelText(/Provider name/i);
    await fireEvent.input(input, { target: { value: 'Alice' } });

    const btn = screen.getByRole('button', { name: /create provider/i });
    await fireEvent.click(btn);

    await waitFor(() => {
      expect(submitCreateProvider).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.findByText(errorMsg)).toBeDefined();
    });
  });

  it('shows loading icon when isLoading is true', async () => {
    render(CreateProvider, { isLoading: true });
    expect(screen.getByTestId('loading-icon')).toBeDefined();
  });

  it('alerts if there is no endpoint', async () => {
    render(CreateProvider);

    user.set({ ...user, network: null });

    const btn = screen.getByRole('button', { name: /Create Provider/i });
    await fireEvent.click(btn);

    expect(alertMock).toHaveBeenCalledWith('Error connecting to endpoint.');
  });

  it('alerts if provider name is empty', async () => {
    render(CreateProvider);

    user.set({
      address: '0x1234',
      network: { endpoint: 'ws://test' },
      msaId: 1234,
      providerName: undefined,
    });

    const btn = screen.getByRole('button', { name: /Create Provider/i });
    await fireEvent.click(btn);

    expect(alertMock).toHaveBeenCalledWith('please enter a Provider Name');
  });

  it('alerts if dotApi.api is not defined', async () => {
    render(CreateProvider);

    dotApi.set({ api: null });

    user.set({
      address: '0x1234',
      network: { endpoint: 'ws://test' },
      msaId: 1234,
    });

    const input = screen.getByLabelText(/Provider name/i);
    await fireEvent.input(input, { target: { value: 'Alice' } });

    const btn = screen.getByRole('button', { name: /Create Provider/i });
    await fireEvent.click(btn);

    expect(alertMock).toHaveBeenCalledWith('please reconnect to an endpoint');
  });
});
