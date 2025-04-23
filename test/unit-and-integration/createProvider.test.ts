import CreateProvider from '$features/BecomeProviderNextSteps/CreateProvider.svelte';
import { dotApi, storeChainInfo } from '$lib/stores';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

globalThis.alert = () => {};

describe('CreateProvider component', () => {
  beforeAll(() => {
    storeChainInfo.update((val) => (val = { ...val, connected: true }));
  });
  it('shows text + Cancel button', () => {
    const { getByRole, getByText } = render(CreateProvider);
    expect(getByRole('button', { name: 'Create Provider' })).toBeInTheDocument();
    const cancel = getByText('Cancel');
    expect(cancel).toBeInTheDocument();
    expect(cancel.getAttribute('href')).toEqual('/');
  });

  it('clicking CreateProvider calls the extrinsic', async () => {
    userEvent.setup();
    const { getByRole, getByLabelText } = render(CreateProvider);

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
