import BecomeAProvider from '$routes/become-a-provider/[[network=networks]]/+page.svelte';
import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { vi } from 'vitest';

vi.mock('$app/navigation', async () => {
  const goto = vi.fn();
  return {
    goto,
  };
});

vi.mock('$app/stores', async () => {
  const { readable, writable } = await import('svelte/store');
  /**
   * @type {import('$app/stores').getStores}
   */
  const getStores = () => ({
    navigating: readable(null),
    page: readable({ url: new URL('http://localhost'), params: {} }),
    session: writable(null),
    updated: readable(false),
  });
  /** @type {typeof import('$app/stores').page} */
  const page = {
    subscribe(fn) {
      return getStores().page.subscribe(fn);
    },
  };
  /** @type {typeof import('$app/stores').navigating} */
  const navigating = {
    subscribe(fn) {
      return getStores().navigating.subscribe(fn);
    },
  };
  /** @type {typeof import('$app/stores').session} */
  const session = {
    subscribe(fn) {
      return getStores().session.subscribe(fn);
    },
  };
  /** @type {typeof import('$app/stores').updated} */
  const updated = {
    subscribe(fn) {
      return getStores().updated.subscribe(fn);
    },
  };
  return {
    getStores,
    navigating,
    page,
    session,
    updated,
  };
});

globalThis.alert = () => {};

describe('BecomeAProvider component', () => {
  afterAll(async () => vi.restoreAllMocks());

  it('shows text + Cancel button', () => {
    const { container, getByTestId } = render(BecomeAProvider);
    const title = container.querySelector('h2');
    expect(title).toHaveTextContent('Become a Provider');
    const cancel = getByTestId('back-home');
    expect(cancel).toBeInTheDocument();
    expect(cancel.getAttribute('href')).toEqual('/');
  });
});
