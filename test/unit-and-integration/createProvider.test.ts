import {dotApi, storeConnected, storeCurrentAction} from "../../src/lib/stores";
import '@testing-library/jest-dom';
import {ActionForms} from "../../src/lib/storeTypes";
import CreateProvider from "../../src/components/CreateProvider.svelte";
import {fireEvent, render, waitFor} from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
globalThis.alert = () => {};

describe("CreateProvider component", () => {
    beforeAll(() => {
        storeConnected.set(true);
    })
    it("shows text + Cancel button", () => {
        const { container, getByRole} = render(CreateProvider)
        const title = container.querySelector('h2');
        expect(title).toHaveTextContent('Become a Provider');
        expect(getByRole('button', {name: 'Create Provider'})).toBeInTheDocument();
        expect(getByRole('button', { name: 'Cancel'})).toBeInTheDocument();
    })
    it("clicking Cancel hides itself (adds the hidden class)", async () => {
        let currentAction = ActionForms.CreateProvider
        storeCurrentAction.subscribe(action => currentAction = action);
        let { container, getByRole} = render(CreateProvider)
        let cancel = getByRole('button', { name: 'Cancel'});
        fireEvent.click(cancel);
        await waitFor(() => {
            expect(currentAction).toEqual(ActionForms.NoForm)
        });
    })
    // TODO: get this working as intended
    it("not filling in a provider name doesn't let you submit and highlights field", () => {
        const { getByRole} = render(CreateProvider)
        let btn = getByRole('button', { name: 'Create Provider'});
        fireEvent.click(btn);
    })
    it('clicking CreateProvider calls the creatProvider function', async () => {
        const user = userEvent.setup();
        const { container, getByRole, getByLabelText} = render(CreateProvider);
        dotApi.update(val => val = {...val, ...{ api: true }});
        let input = container.querySelector('div form input');
        expect(input).toBeInTheDocument();
        await user.type(input,"Bobbay");
        expect(input).toHaveValue("Bobbay");
        let btn = getByRole('button', { name: 'Create Provider'});
        fireEvent.click(btn);
    })

})