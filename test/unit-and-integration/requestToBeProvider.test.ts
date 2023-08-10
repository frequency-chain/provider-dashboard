import {dotApi, storeConnected, storeCurrentAction} from "../../src/lib/stores";
import '@testing-library/jest-dom';
import {ActionForms} from "../../src/lib/storeTypes";
import RequestToBeProvider from "../../src/components/RequestToBeProvider.svelte"
import {fireEvent, render, waitFor} from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

let alertWasCalled = false;
const resetAlert = () => {
    alertWasCalled = false
};
globalThis.alert = () => {
    alertWasCalled = true;
};

describe("RequestToBeProvider component", () => {
    const mockCancelAction = vi.fn();

    beforeEach(()=> {
        resetAlert();
        storeConnected.set(true);
    });

    it('shows text + Cancel button', () => {
        const { container, getByRole } = render(RequestToBeProvider, {cancelAction: mockCancelAction});
        const title = container.querySelector('h2');
        expect(title).toHaveTextContent('Request to Be a Provider');
        expect(getByRole('button', {name: 'Submit Request To Be Provider'})).toBeInTheDocument();
        expect(getByRole('button', {name: 'Cancel'})).toBeInTheDocument();
    })

    it("clicking Cancel performs the cancelAction callback", async () => {
        let currentAction = ActionForms.CreateProvider
        storeCurrentAction.subscribe(action => currentAction = action);

        let { getByRole} = render(RequestToBeProvider, {cancelAction: mockCancelAction})

        let cancel = getByRole('button', { name: 'Cancel'});
        fireEvent.click(cancel);
        expect(mockCancelAction).toHaveBeenCalled()
    })

    it("clicking Request To Be Provider submits extrinsic and shows Transaction status", async () => {
        const user = userEvent.setup();
        const { container, getByRole, getByLabelText, getByText} = render(RequestToBeProvider,
            {cancelAction: mockCancelAction});

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
                tx: { msa: { proposeToBeProvider: mockExtrinsic } },
                isReady: mockReady,
            },
        });
        let input = getByLabelText('Provider name');
        expect(input).toBeInTheDocument();

        let btn = getByRole('button', { name: 'Submit Request To Be Provider'});
        userEvent.click(btn);
        await waitFor(() => {
            expect(extrinsicWasCalled).toBe(false);
        })

        await user.type(input,"Allus");
        expect(input).toHaveValue("Allus");
        userEvent.click(btn);
        await waitFor(() => {
            expect(extrinsicWasCalled).toBe(true)
            expect(container.querySelector('#transaction-status')).not.toHaveClass('hidden')
            expect(getByText('Transaction status')).toBeInTheDocument()
            expect(getByText('Submitting transaction')).toBeInTheDocument()
        })

    })
})