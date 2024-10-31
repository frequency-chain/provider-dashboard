import '@testing-library/jest-dom';
import BecomeAProvider from '$components/BecomeAProvider.svelte';
import { fireEvent, render } from '@testing-library/svelte';
import { vi } from 'vitest';

globalThis.alert = () => {};

describe('BecomeAProvider component', () => {
  const mockCancelAction = vi.fn();

  it('shows text + Cancel button', () => {
    const { container, getByTestId} = render(BecomeAProvider);
    const title = container.querySelector('h2');
    expect(title).toHaveTextContent('Become a Provider');
    const cancel = getByTestId('back-home');
    expect(cancel).toBeInTheDocument();
    expect(cancel.getAttribute('href')).toEqual('/')
  });
});
