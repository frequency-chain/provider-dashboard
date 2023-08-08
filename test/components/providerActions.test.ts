import {storeConnected, storeCurrentAction, storeMsaInfo} from "../../src/lib/stores";
import {ActionForms, MsaInfo} from "../../src/lib/storeTypes";
import {render} from "@testing-library/svelte";
import '@testing-library/jest-dom';
import ProviderActions from "../../src/components/ProviderActions.svelte"

describe("ProviderActions component", () => {
    describe("general rendering", () => {
        beforeAll(() => {
            storeMsaInfo.set((info: MsaInfo) => info = { msaId: 0, providerName: '', isProvider: false})
            storeConnected.set(true);
        })
        it('All children are hidden when currentAction is NoForm', () => {
            storeCurrentAction.set(ActionForms.NoForm);
            const { container, debug} = render(ProviderActions);
            ['add-control-key', 'request-to-be-provider', 'create-provider'].forEach((id) => {
                const el = container.querySelector(`#${id}`);
                expect(el).toHaveClass('hidden')
            })
        })
        describe("Components are not hidden when currentAction is their action", () => {
            [
                {id: 'add-control-key', action: ActionForms.AddControlKey },
                {id: 'request-to-be-provider', action: ActionForms.RequestToBeProvider },
                {id: 'create-provider', action: ActionForms.CreateProvider }
            ].forEach((component) => {
                it(`${component.id} is not hidden`, () => {
                    storeCurrentAction.set(component.action);
                    const { container, debug} = render(ProviderActions);
                    const el = container.querySelector(`#${component.id}`);
                    expect(el).not.toHaveClass('hidden')
                })
            })
        });
    })
})