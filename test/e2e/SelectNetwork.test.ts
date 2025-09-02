import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { vi } from 'vitest';
import SelectNetwork from '../../src/components/features/SelectNetworkAndAccount/SelectNetwork.svelte';
import type { Account } from '../../src/lib/stores/accountsStore';

vi.mock('$lib/stores/networksStore', () => {
  const NetworkType = { CUSTOM: 'custom', STANDARD: 'standard' };

  return {
    allNetworks: writable([
      { id: 'test1', name: 'TestNet1', endpoint: 'wss://test1.node', type: 'STANDARD' },
      { id: 'custom', name: 'Custom', endpoint: '', type: 'CUSTOM' },
    ]),
    NetworkType,
    selectNetworkOptions: (networks: any[]) => networks.map((n) => ({ label: n.name, value: n.name })),
  };
});

describe('SelectNetwork component', () => {
  const connectAndFetchAccountsMock = vi.fn().mockResolvedValue(undefined);
  const resetStateMock = vi.fn();

  const defaultProps = {
    accounts: new Map<string, Account>(),
    newUser: null,
    resetState: resetStateMock,
    connectAndFetchAccounts: connectAndFetchAccountsMock,
    isCustomNetwork: false,
    connectedToEndpoint: false,
    networkErrorMsg: '',
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the network select when not connected', () => {
    render(SelectNetwork, { ...defaultProps });
    expect(screen.getAllByText(/Select a Network/i)).toHaveLength(2);
  });

  it('handles onSelectNetworkChanged', async () => {
    render(SelectNetwork, { ...defaultProps });

    const select = screen.getAllByText(/Select a Network/i)[1];
    await fireEvent.click(select);

    const option = screen.getByText(/TestNet1:/i);
    await fireEvent.click(option);

    await waitFor(() => {
      expect(connectAndFetchAccountsMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/Connected to/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /switch button/i })).toBeInTheDocument();
    });
  });

  it('resets state when switch button is clicked', async () => {
    render(SelectNetwork, { ...defaultProps });

    const select = screen.getAllByText(/Select a Network/i)[1];
    await fireEvent.click(select);

    const option = screen.getByText(/TestNet1:/i);
    await fireEvent.click(option);

    const btn = screen.getByRole('button', { name: /switch button/i });
    await fireEvent.click(btn);

    expect(resetStateMock).toHaveBeenCalled();
  });

  it('handles custom network input on Enter key', async () => {
    render(SelectNetwork, { ...defaultProps });

    const select = screen.getAllByText(/Select a Network/i)[1];
    await fireEvent.click(select);

    const option = screen.getByText(/Custom/i);
    await fireEvent.click(option);

    const input = screen.getByPlaceholderText(/wss:\/\/some.frequency.node/i);
    await fireEvent.input(input, { target: { value: 'wss://custom.node' } });
    await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(input).toHaveValue('wss://custom.node');
  });

  it('does not set endpoint if invalid URL entered', async () => {
    render(SelectNetwork, { ...defaultProps });

    const select = screen.getAllByText(/Select a Network/i)[1];
    await fireEvent.click(select);

    const option = screen.getByText(/Custom/i);
    await fireEvent.click(option);

    const input = screen.getByPlaceholderText(/wss:\/\/some.frequency.node/i);
    await fireEvent.input(input, { target: { value: 'invalid-url' } });
    await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(input).toHaveValue('invalid-url');
  });

  it('calls networkChanged on mount if selectedNetwork exists', async () => {
    const testNetwork = { id: 'test1', name: 'TestNet1', endpoint: 'wss://test1.node', type: 'STANDARD' };

    const connectAndFetchAccountsMock = vi.fn().mockResolvedValue(undefined);

    render(SelectNetwork, {
      ...defaultProps,
      selectedNetwork: testNetwork,
      connectAndFetchAccounts: connectAndFetchAccountsMock,
    });

    await waitFor(() => {
      expect(connectAndFetchAccountsMock).toHaveBeenCalledWith(testNetwork);
    });
  });

  it('returns early if onSelectNetworkChanged receives undefined', async () => {
    const connectAndFetchAccountsMock = vi.fn();

    const { component } = render(SelectNetwork, {
      accounts: new Map(),
      newUser: null,
      resetState: vi.fn(),
      connectAndFetchAccounts: connectAndFetchAccountsMock,
      selectedNetwork: null,
      isCustomNetwork: false,
      connectedToEndpoint: false,
      networkErrorMsg: '',
      isLoading: false,
    });

    await (component as any).onSelectNetworkChanged(undefined);

    expect(connectAndFetchAccountsMock).not.toHaveBeenCalled();
  });
});
