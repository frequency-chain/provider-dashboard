import {dotApi, storeConnected, storeCurrentAction} from "../../src/lib/stores";
import '@testing-library/jest-dom';
import {ActionForms} from "../../src/lib/storeTypes";
import CreateProvider from "../../src/components/CreateProvider.svelte";
import {fireEvent, render, waitFor} from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

globalThis.alert = () => {};

describe("CreateProvider component", () => {
    const mockCancelAction = vi.fn();

    beforeAll(() => {
        storeConnected.set(true);
    })
    it("shows text + Cancel button", () => {
        const { container, getByRole} = render(CreateProvider, {cancelAction: mockCancelAction})
        const title = container.querySelector('h2');
        expect(title).toHaveTextContent('Become a Provider');
        expect(getByRole('button', {name: 'Create Provider'})).toBeInTheDocument();
        expect(getByRole('button', { name: 'Cancel'})).toBeInTheDocument();
    })
    it("clicking Cancel performs the callback", async () => {
        let currentAction = ActionForms.CreateProvider
        storeCurrentAction.subscribe(action => currentAction = action);

        let { getByRole} = render(CreateProvider, {cancelAction: mockCancelAction})

        let cancel = getByRole('button', { name: 'Cancel'});
        fireEvent.click(cancel);
        expect(mockCancelAction).toHaveBeenCalled()
    })
    it('clicking CreateProvider calls the extrinsic', async () => {
        const user = userEvent.setup();
        const { container, getByRole, getByLabelText, getByText} = render(CreateProvider, {cancelAction: mockCancelAction});

        let extrinsicWasCalled = false;
        const mockReady = vi.fn().mockResolvedValue(true);
        const mockExtrinsic = vi.fn().mockImplementation(() => {
            extrinsicWasCalled = true;
            return { signAndSend: vi.fn() }
        })
        dotApi.update(val => val = {
            ...val,
            selectedEndpoint: "ws://localhost:9944",
            api: {
                tx: { msa: { createProvider: mockExtrinsic } },
                isReady: mockReady,
            },
        });
        let input = getByLabelText('Provider name');
        expect(input).toBeInTheDocument();

        let btn = getByRole('button', { name: 'Create Provider'});
        userEvent.click(btn);
        await waitFor(() => {
            expect(extrinsicWasCalled).toBe(false);
        })

        await user.type(input,"Bobbay");
        expect(input).toHaveValue("Bobbay");
        userEvent.click(btn);
        await waitFor(() => {
            expect(extrinsicWasCalled).toBe(true)
            expect(container.querySelector('#transaction-status')).not.toHaveClass('hidden')
            expect(getByText('Transaction status')).toBeInTheDocument()
            expect(getByText('Submitting transaction')).toBeInTheDocument()
        })
    })

})