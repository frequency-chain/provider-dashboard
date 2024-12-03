import { cleanup, fireEvent, getByRole, render, screen, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import Page from '$routes/[[network=networks]]/+page.svelte';
import { pageContent } from '../../src/lib/stores/pageContentStore';
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

// global.alert = () => {};
// vitest mocking
globalThis.alert = () => {};

const getByTextContent = (text) => {
  // Passing function to `getByText`
  return screen.getByText((_content, element) => {
    const hasText = (element) => element.textContent === text;
    const elementHasText = hasText(element);
    const childrenDontHaveText = Array.from(element?.children || []).every((child) => !hasText(child));
    return elementHasText && childrenDontHaveText;
  });
};

describe('displays correct component', () => {
  afterAll(async () => vi.restoreAllMocks());

  it('renders Dashboard component when $pageContent is PageContent.Dashboard', async () => {
    pageContent.dashboard();
    const { container } = render(Page);
    expect(container.querySelector('#dashboard') as HTMLElement).toBeInTheDocument();
  });

  it('renders ProviderLogin component when $pageContent is PageContent.Login', async () => {
    pageContent.login();
    const { getByText, container } = render(Page);
    expect(getByText(/Provider Login/)).toBeInTheDocument();
    expect(getByText(/Not a Provider\?/)).toBeInTheDocument();
    expect(container.querySelector('a[href="/become-a-provider"]')).toBeInTheDocument();
  });
});

describe('/become-a-provider', () => {
  it('is accessible from main page', () => {
    pageContent.login();
    const { container } = render(Page);
    expect(container.querySelector('a[href="/become-a-provider"]')).toBeInTheDocument();
  });
});

describe('End to End Tests', () => {
  // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
  afterEach(() => cleanup());

  test('connect to localhost from login', async () => {
    pageContent.login();

    const { container, getByText, getByLabelText } = render(Page);
    expect(getByText('Provider Login')).toBeInTheDocument();
    expect(getByLabelText('Select a Network')).toBeInTheDocument();

    // Get the select box to log back in
    const select = container.querySelector('#network');
    expect(select).not.toBeNull();

    // Change the select box value
    await fireEvent.change(select!, { target: { value: 'LOCALHOST: ws://127.0.0.1:9944' } });

    // Be sure to wait for all the promises to resolve before checking the result
    await waitFor(() => {
      expect(select).toHaveTextContent('Localhost: ws://127.0.0.1:9944');
    });

    const btn = container.querySelector('button#connect-button');
    if (btn) await fireEvent.click(btn);

    waitFor(() => {
      expect(container.querySelector('#dashboard') as HTMLElement).toBeInTheDocument();
      const connectedNetwork = container.querySelector('#connected-network');
      expect(connectedNetwork).toEqual('LOCALHOST');
    });
  });

  test('values persist on reload', async () => {
    const { container } = render(Page);

    waitFor(() => {
      expect(container.querySelector('#dashboard') as HTMLElement).toBeInTheDocument();
      const connectedNetwork = container.querySelector('#connected-network');
      expect(connectedNetwork).toEqual('LOCALHOST');
    });
  });
});
