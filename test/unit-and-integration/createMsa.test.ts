import CreateMsa from '$features/BecomeProviderNextSteps/CreateMsa.svelte';
import { storeChainInfo } from '$lib/stores';
import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { vi } from 'vitest';

globalThis.alert = () => {};

describe('CreateMsa component', () => {
  const mockCancelAction = vi.fn();

  beforeAll(() => {
    storeChainInfo.update((val) => (val = { ...val, connected: true }));
  });
  it('shows text + Cancel button', () => {
    const { getByRole, getByText } = render(CreateMsa);
    expect(getByRole('button', { name: 'Create an MSA' })).toBeInTheDocument();
    const cancel = getByText('Cancel');
    expect(cancel).toBeInTheDocument();
    expect(cancel.getAttribute('href')).toEqual('/');
  });

  // TODO: we introduced create api into the parent component, which now breaks the test.
  // TODO: redo API structure or redo test.

  // it('clicking CreateMsa calls the extrinsic', async () => {
  //   userEvent.setup();
  //   const { container, getByRole, getByText } = render(CreateMsa, {
  //     cancelAction: mockCancelAction,
  //   });

  //   let extrinsicWasCalled = false;
  //   const mockReady = vi.fn().mockResolvedValue(true);
  //   const mockExtrinsic = vi.fn().mockImplementation(() => {
  //     extrinsicWasCalled = true;
  //     return { signAndSend: vi.fn() };
  //   });

  //   dotApi.update(
  //     (val) =>
  //       (val = {
  //         ...val,
  //         selectedEndpoint: 'ws://localhost:9944',
  //         api: {
  //           tx: { msa: { create: mockExtrinsic } },
  //           isReady: mockReady,
  //         },
  //       })
  //   );

  //   const btn = getByRole('button', { name: 'Create an MSA' });
  //   userEvent.click(btn);
  //   await waitFor(() => {
  //     expect(mockCancelAction).toHaveBeenCalled();
  //     expect(extrinsicWasCalled).toBe(true);
  //     expect(container.querySelector('#transaction-status')).not.toHaveClass('hidden');
  //     expect(getByText('Transaction Status')).toBeInTheDocument();
  //     expect(getByText('Submitting transaction')).toBeInTheDocument();
  //   });
  // });
});
