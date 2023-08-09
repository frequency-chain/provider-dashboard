import {dotApi, storeConnected, storeCurrentAction} from "../../src/lib/stores";
import '@testing-library/jest-dom';
import { vitest } from "vitest";
import {ActionForms} from "../../src/lib/storeTypes";
import CreateProvider from "../../src/components/CreateProvider.svelte";
import {fireEvent, render, waitFor} from "@testing-library/svelte";
import {createProvider} from "../../src/lib/polkadotApi";
import userEvent from "@testing-library/user-event";

describe("CreateProvider component", () => {
    beforeAll(() => {
        storeConnected.set(true);
    })
    it("when currentAction != 'me' the container has a hidden class", () => {
        const { container } = render(CreateProvider,
            {msaId: 0, currentAction: ActionForms.AddControlKey})
        expect(container.querySelector("#create-provider")).toHaveClass('hidden')
    });
    describe("when currentAction === 'me'", () => {
        it("does not have a hidden class", () => {
            const { container } = render(CreateProvider,
                {msaId: 0, currentAction: ActionForms.CreateProvider})
            expect(container.querySelector("#create-provider")).not.toHaveClass('hidden')
        })
        it("shows text + Cancel button", () => {
            const { container, getByRole} = render(CreateProvider,
                {msaId: 0, currentAction: ActionForms.CreateProvider})
            const title = container.querySelector('h2');
            expect(title).toHaveTextContent('Become a Provider');
            expect(getByRole('button', {name: 'Create Provider'})).toBeInTheDocument();
            expect(getByRole('button', { name: 'Cancel'})).toBeInTheDocument();
        })
        it("clicking Cancel hides itself (adds the hidden class)", async () => {
            let currentAction = ActionForms.CreateProvider
            storeCurrentAction.subscribe(action => currentAction = action);
            let { container, getByRole} = render(CreateProvider,
                {msaId: 0, currentAction: currentAction})
            let cancel = getByRole('button', { name: 'Cancel'});
            fireEvent.click(cancel);
            await waitFor(() => {
                expect(currentAction).toEqual(ActionForms.NoForm)
            });
        })
        it("not filling in a provider name doesn't let you submit and highlights field", () => {
            const mock = vi.fn().mockImplementation(createProvider);
            const { container, getByRole} = render(CreateProvider,
                {msaId: 0, currentAction: ActionForms.CreateProvider})
            let btn = getByRole('button', { name: 'Create Provider'});
            fireEvent.click(btn);
            expect(mock).toHaveBeenCalled()
        })
        it('clicking CreateProvider calls the creatProvider function', async () => {
            const user = userEvent.setup();
            const { container, getByRole, getByLabelText} = render(CreateProvider,
                {msaId: 25, currentAction: ActionForms.CreateProvider});
            dotApi.update(val => val = {...val, ...{ api: true }});
            let input = container.querySelector('div form input');
            expect(input).toBeInTheDocument();
            await user.type(input,"Bobbay");
            expect(input).toHaveValue("Bobbay");
            let btn = getByRole('button', { name: 'Create Provider'});
            fireEvent.click(btn);
        })
    })

})