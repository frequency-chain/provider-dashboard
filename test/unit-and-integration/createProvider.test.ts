import { dotApi, storeChainInfo } from '../../src/lib/stores';
import '@testing-library/jest-dom';
import CreateProvider from '../../src/components/CreateProvider.svelte';
import { vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

globalThis.alert = () => {};

describe('CreateProvider component', () => {
  const mockCancelAction = vi.fn();

  beforeAll(() => {
    storeChainInfo.update((val) => (val = { ...val, connected: true }));
  });
  it('shows text + Cancel button', () => {
    const { getByRole } = render(CreateProvider, { cancelAction: mockCancelAction });
    expect(getByRole('button', { name: 'Create Provider' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
  it('clicking Cancel performs the callback', async () => {
    const { getByRole } = render(CreateProvider, { cancelAction: mockCancelAction });

    const cancel = getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancel);
    expect(mockCancelAction).toHaveBeenCalled();
  });
  it('clicking CreateProvider calls the extrinsic', async () => {
    const user = userEvent.setup();
    const { container, getByRole, getByLabelText, getByText } = render(CreateProvider, {
      cancelAction: mockCancelAction,
    });

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
            tx: { msa: { createProvider: mockExtrinsic } },
            isReady: mockReady,
          },
        })
    );
    const input = getByLabelText('Provider name');
    expect(input).toBeInTheDocument();

    //failure case
    const btn = getByRole('button', { name: 'Create Provider' });
    userEvent.click(btn);
    await waitFor(() => {
      expect(extrinsicWasCalled).toBe(false);
    });

    // TODO: we introduced create api into the parent component, which now breaks the test.
    // TODO: redo API structure or redo test.

    //success case
    // await user.type(input, 'Bobbay');
    // expect(input).toHaveValue('Bobbay');
    // userEvent.click(btn);
    // await waitFor(() => {
    //   expect(mockCancelAction).toHaveBeenCalled();
    //   expect(extrinsicWasCalled).toBe(true);
    //   expect(container.querySelector('#transaction-status')).not.toHaveClass('hidden');
    //   expect(getByText('Transaction status')).toBeInTheDocument();
    //   expect(getByText('Submitting transaction')).toBeInTheDocument();
    // });
  });
});
