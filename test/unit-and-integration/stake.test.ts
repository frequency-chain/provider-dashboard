import Stake, { stakeAmount } from '$features/Capacity/Stake.svelte';
import { dotApi, storeChainInfo } from '$lib/stores';
import { Account, allAccountsStore } from '$lib/stores/accountsStore';
import { user } from '$lib/stores/userStore';
import Keyring from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { waitReady } from '@polkadot/wasm-crypto';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const resolvedApi = {
    isReady: vi.fn().mockResolvedValue(true),
    tx: {
      capacity: {
        stake: vi.fn(() => ({ signAndSend: vi.fn(), hash: '0x123456' })),
      },
    },
  };

  const mockApiPromise: any = vi.fn();
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
  beforeAll(async () => {
    await waitReady(); // Ensure WASM interface is ready before running tests
  });

  beforeEach(() => {
    const keyring = new Keyring({ type: 'sr25519' });
    const keyringPair: KeyringPair = { ...keyring.addFromUri('//Alice'), ...{ meta: { name: '//Alice' } } };

    const account: Account = {
      address: keyringPair.address,
      isProvider: true,
      msaId: 1,
      providerName: 'test',
      keyringPair,
    };
    user.set(account);
    allAccountsStore.set(new Map([[account.address, account]]));
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

  it('Stake button submits transaction', async () => {
    const createdApi = await mocks.ApiPromise.create();

    // Mock stores so Select is rendered & enabled
    storeChainInfo.update((val) => ({ ...val, connected: true }));
    dotApi.update((val) => ({ ...val, api: createdApi }));
    allAccountsStore.set(
      new Map<string, Account>([
        [
          '5Ft7Wfr4FKTN3rYwBdZjpVpGQq3cFhNBWY1nHxySejos1dDa',
          {
            address: '5Ft7Wfr4FKTN3rYwBdZjpVpGQq3cFhNBWY1nHxySejos1dDa',
            display: 'Account2',
            injectedAccount: { address: '5Ft7Wfr4FKTN3rYwBdZjpVpGQq3cFhNBWY1nHxySejos1dDa', meta: {}, type: 'sr25519' },
            isProvider: true,
            keyringPair: undefined,
            msaId: 76894,
          },
        ],
      ])
    );

    render(Stake);

    const [outerOpenButton] = screen.getAllByRole('button', { name: /Stake to Provider/i });
    await userEvent.click(outerOpenButton);

    const trigger = screen.getByRole('combobox', { id: 'stake-using-account-id' });
    await userEvent.click(trigger);

    const option = await screen.findByRole('option', {
      name: /Provider #76894: 5Ft7Wfr4FKTN3rYwBdZjpVpGQq3cFhNBWY1nHxySejos1dD/i,
    });
    await userEvent.click(option);

    const [outerSubmitButton] = screen.getAllByRole('button', { name: 'Stake' });
    await userEvent.click(outerSubmitButton);
  });
});
