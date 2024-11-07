import '@testing-library/jest-dom';
import BecomeAProvider from '$components/BecomeAProvider.svelte';
import { render } from '@testing-library/svelte';

globalThis.alert = () => {};

describe('BecomeAProvider component', () => {

  it('shows text + Cancel button', () => {
    const { container, getByTestId } = render(BecomeAProvider);
    const title = container.querySelector('h2');
    expect(title).toHaveTextContent('Become a Provider');
    const cancel = getByTestId('back-home');
    expect(cancel).toBeInTheDocument();
    expect(cancel.getAttribute('href')).toEqual('/');
  });
});
