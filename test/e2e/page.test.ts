import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import Page from '$routes/+page.svelte';

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

describe('End to End Tests', () => {
  // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
  afterEach(() => cleanup());

  test('connect to localhost', async () => {
    const { container, getByLabelText } = render(Page);
    const statusBar = container.querySelector('#chain-status');
    expect(statusBar).toBeDefined();
    // Get the select box
    const select = getByLabelText('Select a Network');

    // Change the select box value
    await fireEvent.change(select, { target: { value: 'LOCALHOST: ws://127.0.0.1:9944' } });

    // Be sure to wait for all the promises to resolve before checking the result
    await waitFor(() => {
      expect(select).toHaveTextContent('LOCALHOST: ws://127.0.0.1:9944');
    });

    const btn = container.querySelector('button#connect-button');
    if (btn) await fireEvent.click(btn);

    // const connectionStatusValue = container.querySelector('#connection-status-value');
    // await waitFor(() => {
    //   expect(connectionStatusValue).toHaveTextContent('Connected');
    // });
  });
});
