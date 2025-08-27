import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { vi } from 'vitest';
import CreateProvider from '../../src/components/features/BecomeProviderNextSteps/CreateProvider.svelte';
import { submitCreateProvider } from '../../src/lib/connections';

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
  getMsaInfo: vi.fn().mockResolvedValue({ providerName: 'TestProvider', isProvider: true }),
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
}));

// Stores — simplest way is to provide fakes
vi.mock('$lib/stores', () => ({
  dotApi: writable({ api: {} }),
  logout: vi.fn(),
}));

vi.mock('$lib/stores/userStore', () => ({
  user: writable({
    address: '5abc',
    network: { endpoint: 'ws://test' },
  }),
}));

describe('CreateProvider component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('calls submitCreateProvider on click with valid input', async () => {
    render(CreateProvider, { isLoading: false });
    const input = screen.getByLabelText(/Provider name/i);
    await fireEvent.input(input, { target: { value: 'Alice' } });

    const btn = screen.getByRole('button', { name: /create provider/i });
    await fireEvent.click(btn);

    await waitFor(() => {
      expect(submitCreateProvider).toHaveBeenCalled();
    });
  });

  it('shows loading icon when isLoading is true', async () => {
    render(CreateProvider, { isLoading: true });
    expect(screen.getByTestId('loading-icon')).toBeDefined();
  });
});
