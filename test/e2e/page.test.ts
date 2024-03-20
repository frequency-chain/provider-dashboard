import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import Page from '$routes/+page.svelte';
import { pageContent } from '../../src/lib/stores/pageContentStore';

// global.alert = () => {};
// vitest mocking
globalThis.alert = () => {};

const getByTextContent = (text) => {
  // Passing function to `getByText`
  return screen.getByText((content, element) => {
    const hasText = (element) => element.textContent === text;
    const elementHasText = hasText(element);
    const childrenDontHaveText = Array.from(element?.children || []).every((child) => !hasText(child));
    return elementHasText && childrenDontHaveText;
  });
};

describe('displays correct component', () => {
  it('renders Dashboard component when $pageContent is PageContent.Dashboard', async () => {
    pageContent.dashboard();
    const { container } = render(Page);
    expect(container.querySelector('#dashboard') as HTMLElement).toBeInTheDocument();
  });

  it('renders ProviderLogin component when $pageContent is PageContent.Login', async () => {
    pageContent.login();
    const { container } = render(Page);
    expect(container.querySelector('#provider-login') as HTMLElement).toBeInTheDocument();
  });

  it('renders BecomeAProvider component when $pageContent is PageContent.BecomeProvider', async () => {
    pageContent.becomeProvider();
    const { container } = render(Page);
    expect(container.querySelector('#become-a-provider') as HTMLElement).toBeInTheDocument();
  });
});

describe('End to End Tests', () => {
  // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
  afterEach(() => cleanup());

  test('connect to localhost from login', async () => {
    pageContent.login();

    const { container, getByText } = render(Page);
    expect(getByText('Provider Login')).toBeInTheDocument();
    expect(getByText('Select a Network')).toBeInTheDocument();

    // Get the select box to log back in
    const select = container.querySelector('#network');
    expect(select).not.toBeNull();

    // Change the select box value
    await fireEvent.change(select!, { target: { value: 'LOCALHOST: ws://127.0.0.1:9944' } });

    // Be sure to wait for all the promises to resolve before checking the result
    await waitFor(() => {
      expect(select).toHaveTextContent('LOCALHOST: ws://127.0.0.1:9944');
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
