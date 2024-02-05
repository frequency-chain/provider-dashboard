import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import { dotApi, storeChainInfo } from '../../src/lib/stores';
import Stake, { stakeAmount } from '$components/Stake.svelte';
import { user } from '../../src/lib/stores/userStore';

const mocks = vi.hoisted(() => {
  const resolvedApi = {
    isReady: vi.fn().mockResolvedValue(true),
  };

  const mockApiPromise = vi.fn();
  mockApiPromise.create = vi.fn().mockResolvedValue(resolvedApi);

  const mockWeb3FromSource = vi.fn();
  return {
    ApiPromise: mockApiPromise,
    web3FromSource: mockWeb3FromSource,
  };
});

vi.mock('@polkadot/api', async () => {
  return { ApiPromise: mocks.ApiPromise };
});

describe('Stake.svelte Unit Tests', () => {
  beforeEach(() => {
    user.set({ address: '', isProvider: true, msaId: 1, providerName: 'test' });
  });
  afterEach(() => cleanup());

  it('Stake component mounts correctly', () => {
    const { container } = render(Stake);
    expect(container).toBeInTheDocument();
  });

  it('Stake input is converted to number', async () => {
    render(Stake);
    const input = screen.queryByRole('input');
    if (input) {
      await fireEvent.input(input, { target: { value: '1' } });
      expect(stakeAmount).toBe(1);
      await fireEvent.input(input, { target: { value: '22' } });
      expect(stakeAmount).toBe(22);
      await fireEvent.input(input, { target: { value: '' } });
      expect(stakeAmount).toBe(0);
    }
  });

  it('Shows alert if no staking key is selected', async () => {
    const mockAlert = vi.fn();
    window.alert = mockAlert;

    render(Stake);
    const button = screen.getByRole('button', { name: 'Stake' });
    await fireEvent.click(button);
    expect(mockAlert).toBeCalledWith('Please choose a key to stake from.');
  });

  it('Stake button submits transaction', async () => {
    const createdApi = await mocks.ApiPromise.create();
    storeChainInfo.update((val) => val = {...val, connected: true});

    const { getByText } = render(Stake);
    await dotApi.update((val) => (val = { ...val, api: createdApi }));

    const button = screen.getByRole('button', { name: 'Stake' });
    await fireEvent.click(button);
    expect(getByText('Transaction status')).toBeInTheDocument();
  });
});
