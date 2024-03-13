import '@testing-library/jest-dom';
import BecomeAProvider from '$components/BecomeAProvider.svelte';
import { fireEvent, render } from '@testing-library/svelte';
import { vi } from 'vitest';

globalThis.alert = () => {};

describe('BecomeAProvider component', () => {
  const mockCancelAction = vi.fn();

  it('shows text + Cancel button', () => {
    const { container, getByRole } = render(BecomeAProvider, { cancelAction: mockCancelAction });
    const title = container.querySelector('h2');
    expect(title).toHaveTextContent('Become a Provider');
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('clicking Cancel performs the cancelAction callback', async () => {
    const { getByRole } = render(BecomeAProvider, { cancelAction: mockCancelAction });

    const cancel = getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancel);
    expect(mockCancelAction).toHaveBeenCalled();
  });
});
