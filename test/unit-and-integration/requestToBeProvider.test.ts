import { dotApi, storeChainInfo } from '../../src/lib/stores';
import '@testing-library/jest-dom';
import RequestToBeProvider from '../../src/components/RequestToBeProvider.svelte';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { user } from '../../src/lib/stores/userStore';
import { Account } from '../../src/lib/stores/accountsStore';
import Keyring from '@polkadot/keyring';

globalThis.alert = () => {};

describe('RequestToBeProvider component', () => {
  beforeEach(() => {
    storeChainInfo.update((val) => (val = { ...val, connected: true }));

    const keyring = new Keyring({ type: 'sr25519' });
    const keyRingPair = keyring.addFromUri('//Alice');
    const account = new Account();
    account.address = keyRingPair.address;
    account.keyringPair = keyRingPair;
    user.set(account);
  });

  it('shows text + Cancel button', () => {
    const { container, getByRole, getByText } = render(RequestToBeProvider);
    const title = container.querySelector('h2');
    expect(title).toHaveTextContent('Request to Be a Provider');
    expect(getByRole('button', { name: 'Submit Request To Be Provider' })).toBeInTheDocument();
    expect(getByText('Cancel')).toBeInTheDocument();
  });

  it('clicking Cancel goes back home', async () => {
    const { container, getByText } = render(RequestToBeProvider);
    const cancel = getByText('Cancel').click();
  });

  it('clicking Request To Be Provider submits extrinsic and shows Transaction Status', async () => {
    const user = userEvent.setup();
    const { getByRole, getByLabelText } = render(RequestToBeProvider);

    let extrinsicWasCalled = false;
    const mockReady = vi.fn().mockResolvedValue(true);
    const mockExtrinsic = vi.fn(() => {
      extrinsicWasCalled = true;
      return { signAndSend: vi.fn(), hash: '0x123456' };
    });
    dotApi.update(
      (val) =>
        (val = {
          ...val,
          selectedEndpoint: 'ws://localhost:9944',
          api: {
            tx: { msa: { proposeToBeProvider: mockExtrinsic } },
            isReady: mockReady,
          },
        })
    );
    const input = getByLabelText('Provider name');
    expect(input).toBeInTheDocument();

    const btn = getByRole('button', { name: 'Submit Request To Be Provider' });
    userEvent.click(btn);
    await waitFor(() => {
      expect(extrinsicWasCalled).toBe(false);
    });

    await user.type(input, 'Allus');
    expect(input).toHaveValue('Allus');
    userEvent.click(btn);
    await waitFor(() => {
      expect(extrinsicWasCalled).toBe(true);
    });
  });
});
