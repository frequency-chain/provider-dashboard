import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import '@testing-library/jest-dom'
import { storeConnected } from '$lib/stores'
import Connect from '$components/Connect.svelte'

// vitest mocking: TODO: this hides an alert window but doesn't affect the parameters
//                       tested here. It should not be mocked for e2e tests.
globalThis.alert = () => {};

// Helper function to get text that is broken up into multiple elements (->stackExchange)
const getByTextContent = (text: string) => {
    // Passing custom matcher function to `getByText`
    return screen.getByText((_content, element) => {
        const hasText = element => element.textContent === text
        const elementHasText = hasText(element)
        const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child))
        return elementHasText && childrenDontHaveText
    })
}
  

describe('Connect.svelte Unit Tests', () => {
    beforeAll
    // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
    afterEach(() => cleanup())

    let props = {
            token: '',
    };

    it('Connection component mounts correctly', () => {
        const { container } = render(Connect, props);
        expect(container).toBeInTheDocument();
    })

    it('selectedProvider changes according to select box', async () => {
        const { getByRole } = render(Connect, props);
        const select = getByRole('combobox');

        await fireEvent.change(select, { target: { value: 'Rococo' } });

        // Be sure to wait for all the promises to resolve before checking the result
        await waitFor(() => {
            expect(select).toHaveValue('Rococo');
        });
        let selectedProvider = getByTextContent('Selected Provider: Rococo');
        expect(selectedProvider).toBeInTheDocument();

        await fireEvent.change(select, { target: { value: 'Localhost' } });
        await waitFor(() => {
            expect(select).toHaveValue('Localhost');
        });
        selectedProvider = getByTextContent('Selected Provider: Localhost');
        expect(selectedProvider).toBeInTheDocument();

        await fireEvent.change(select, { target: { value: 'Other' } }); 
        await waitFor(() => {
            expect(select).toHaveValue('Other');
        });
        selectedProvider = getByTextContent('Selected Provider: Other');
        expect(selectedProvider).toBeInTheDocument();
    })

    it('Other provider can be entered when Other selected', async () => {
        render(Connect, props);
        const select = screen.getByRole('combobox');
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();

        await fireEvent.change(select, { target: { value: 'Other' } });
        await waitFor(() => {
            expect(input).toBeEnabled();
        });

        await fireEvent.change(input, { target: { value: 'wss://testing.some.node' } });
        // Check the otherProvider changes
        await waitFor(() => {
            expect(input).toHaveValue('wss://testing.some.node');
        });
    });

    it('Connect button is disabled after connection', async () => {
        render(Connect, props);
        const btn = screen.getByRole('button');
        await fireEvent.click(btn);
        await waitFor(() => {
            expect(btn).toBeDisabled();
        });
    });

    it('Connect button is enabled after changing provider', async () => {
        render(Connect, props);
        const btn = screen.getByRole('button');
        const select = screen.getByRole('combobox');
        await fireEvent.change(select, { target: { value: 'Other' } });
        await waitFor(() => {
            expect(btn).toBeEnabled();
        });
    });

    it('Can subscribe to storeConnected', () => {
        storeConnected.set(false);
        render(Connect, props)

        let storeValue;
        const unsubscribe = storeConnected.subscribe(value => {
            storeValue = value;
        });

        // Mock change to storeConnected value
        storeConnected.set(true);
        expect(storeValue).toEqual(true)

        storeConnected.set(false);
        expect(storeValue).toEqual(false)
        unsubscribe();

        // Value doesn't change after unsubscribe
        storeConnected.set(true);
        expect(storeValue).toEqual(false)
    })
})

/*
//TODO improvements
    - alternatives to expect with innerHTML
 */
