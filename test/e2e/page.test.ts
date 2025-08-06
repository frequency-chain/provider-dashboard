import { pageContent } from '$lib/stores/pageContentStore';
import Page from '$routes/[[network=networks]]/+page.svelte';
import Keyring from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import '@testing-library/jest-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
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
    const { getByText, getByRole } = render(Page);
    expect(getByText(/Provider Login/)).toBeInTheDocument();
    expect(getByText(/Not a Provider\?/)).toBeInTheDocument();
    expect(getByRole('button', { name: /Become A Provider/i })).toBeInTheDocument();
  });
});

describe('/become-a-provider', () => {
  it('is accessible from main page', () => {
    pageContent.login();
    const { getByRole } = render(Page);
    expect(getByRole('button', { name: /Become A Provider/i })).toBeInTheDocument();
  });
});

describe('End to End Tests', () => {
  // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
  afterEach(() => cleanup());

  const keyring = new Keyring({ type: 'sr25519' });
  const alice: KeyringPair = { ...keyring.addFromUri('//Alice'), ...{ meta: { name: '//Alice' } } };
  const providerAccount = {
    address: alice.address,
    isProvider: true,
    msaId: 1,
    providerName: 'test',
    keyringPair: alice,
  };
  const mockAccounts = new Map([[alice.address, providerAccount]]);

  // test('connect to localhost from login', async () => {
  //   pageContent.login();

  //   const { container, getByText } = render(Page);
  //   expect(getByText('Provider Login')).toBeInTheDocument();

  //   // Get the select box to select network for login
  //   const selectNetwork = container.querySelector('#network');
  //   expect(selectNetwork).not.toBeNull();
  //   if (selectNetwork) fireEvent.click(selectNetwork);

  //   // Change the select box value
  //   getByText('Localhost: ws://127.0.0.1:9944').click();

  //   // Be sure to wait for all the promises to resolve before checking the result
  //   await waitFor(() => {
  //     // expect the trigger to show the selected value
  //     expect(screen.getByText('Connected to Localhost')).toBeVisible();
  //   });

  //   allAccountsStore.set(mockAccounts);

  //   // Get the select box to select address for login
  //   const selectAddress = container.querySelector('#controlkeys');
  //   expect(selectAddress).not.toBeNull();
  //   if (selectAddress) fireEvent.click(selectAddress);

  //   // Change the select box value
  //   const accountOption = `${providerAccount.providerName || `Provider #${providerAccount.msaId}`}: ${providerAccount.address}`;

  //   const curAccountOption = screen.getByText(accountOption);
  //   expect(curAccountOption).not.toBeNull();
  //   // select address
  //   fireEvent.click(curAccountOption);

  //   // Be sure to wait for all the promises to resolve before checking the result
  //   await waitFor(() => {
  //     // expect the trigger to show the selected value
  //     screen.debug();
  //     const selectedAccount = screen.getByText(accountOption, { exact: false });
  //     console.log('selectedAccount', selectedAccount);
  //     expect(selectedAccount).toBeVisible();
  //   });

  //   // click login button
  //   // console.log('screen', screen);
  //   const loginButton = screen.getByText('Connect to Account');
  //   expect(loginButton).not.toBeDisabled();
  //   fireEvent.click(loginButton);

  //   await waitFor(() => {
  //     expect(container.querySelector('#dashboard')).toBeVisible();
  //     const connectedNetwork = container.querySelector('#connected-network');
  //     expect(connectedNetwork?.textContent?.trim()).toBe('LOCALHOST');
  //   });
  // });

  test('values persist on reload', async () => {
    const { container } = render(Page);

    waitFor(() => {
      expect(container.querySelector('#dashboard') as HTMLElement).toBeInTheDocument();
      const connectedNetwork = container.querySelector('#connected-network');
      expect(connectedNetwork).toEqual('LOCALHOST');
    });
  });
});
