import {
    dotApi,
    storeConnected,
    storeCurrentAction,
    storeMsaInfo,
    transactionSigningAddress
} from "../../src/lib/stores";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event";
import {render, waitFor} from "@testing-library/svelte";
import Provider from "$components/Provider.svelte";
import ProviderActions from "$components/ProviderActions.svelte";
// import AddControlKey from "$components/AddControlKey.svelte";
// import RequestToBeProvider from "$components/RequestToBeProvider.svelte";
import {ActionForms, DotApi, MsaInfo} from "../../src/lib/storeTypes";

describe("Provider component and action buttons", () => {
    beforeEach(() => {
        storeConnected.set(true);
        storeCurrentAction.set(ActionForms.NoForm);
        storeMsaInfo.set((info: MsaInfo) => info = {isProvider: false, msaId: 0, providerName: ''})
    });

    it("when they are a provider, AddControlKey can be clicked, then AddControlKey component is shown", async () => {
        storeMsaInfo.update((info: MsaInfo) => info = {...info, isProvider: true, msaId: 99, providerName: 'Testy'});
        let currentAction = ActionForms.NoForm;
        storeCurrentAction.subscribe(action => currentAction = action);
        const provider = render(Provider);
        const providerActions = render(ProviderActions);
        const actionButton = provider.getByRole('button', {name: 'Add control key'})
        expect(actionButton).toBeInTheDocument();
        userEvent.click(actionButton);
        await waitFor(() => {
            expect(currentAction).toEqual(ActionForms.AddControlKey);
            const expectedForm = providerActions.container.querySelector('#add-control-key')
            expect(expectedForm).toBeInTheDocument()
            expect(expectedForm).not.toHaveClass('hidden');
        });
    })
    describe("when connected to localhost", () => {
        beforeEach(() => {
            dotApi.update((api: DotApi) => api = {...api, selectedEndpoint: "ws://localhost:9944"});
        })
        describe("when a signing address is selected", () => {
            beforeEach(() => transactionSigningAddress.set('0xabcdbeef'))

            it("when they aren't a provider, Become Provider can be clicked, then Create Provider component is shown", async () => {
                storeMsaInfo.update((info: MsaInfo) => info = {isProvider: false, msaId: 99, providerName: ''});
                let currentAction = ActionForms.NoForm;
                storeCurrentAction.subscribe(action => currentAction = action);
                const provider = render(Provider);
                const providerActions = render(ProviderActions);
                const actionButton = provider.getByRole('button', {name: 'Become a Provider'})
                expect(actionButton).toBeInTheDocument();
                userEvent.click(actionButton);
                await waitFor(() => {
                    expect(currentAction).toEqual(ActionForms.CreateProvider);
                    const expectedForm = providerActions.container.querySelector('#create-provider')
                    expect(expectedForm).toBeInTheDocument()
                    expect(expectedForm).not.toHaveClass('hidden');
                });
            })
        })
    })
    describe("when connected to mainnet", () => {
        beforeEach(() => {
            dotApi.update((api: DotApi) => api = {...api, selectedEndpoint: "wss://1.rpc.frequency.xyz"});
        })
        describe("when a signing address is selected", () => {
            beforeEach(() => transactionSigningAddress.set('0xabcdbeef'))
            it("if they aren't a provider, Become Provider can be clicked, then Request to be provider is shown", async () => {
                storeMsaInfo.update((info: MsaInfo) => info = {isProvider: false, msaId: 99, providerName: ''});
                let currentAction = ActionForms.NoForm;
                storeCurrentAction.subscribe(action => currentAction = action);
                const provider = render(Provider);
                const providerActions = render(ProviderActions);
                const actionButton = provider.getByRole('button', {name: 'Become a Provider'})
                expect(actionButton).toBeInTheDocument();
                userEvent.click(actionButton);
                await waitFor(() => {
                    expect(currentAction).toEqual(ActionForms.RequestToBeProvider);
                    const expectedForm = providerActions.container.querySelector('#request-to-be-provider')
                    expect(expectedForm).toBeInTheDocument()
                    expect(expectedForm).not.toHaveClass('hidden');
                });
            })
        })
    })
})