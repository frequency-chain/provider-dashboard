import {
  dotApi,
  storeConnected,
  storeCurrentAction,
  storeMsaInfo,
  transactionSigningAddress,
} from '../../src/lib/stores';
import { ActionForms, DotApi, MsaInfo } from '../../src/lib/storeTypes';
import { render, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import ProviderActions from '../../src/components/ProviderActions.svelte';
import userEvent from '@testing-library/user-event';

describe('ProviderActions component', () => {
  describe('general rendering', () => {
    beforeAll(() => {
      storeMsaInfo.set((info: MsaInfo) => (info = { msaId: 0, providerName: '', isProvider: false }));
      storeConnected.set(true);
    });
    it('All children are hidden when currentAction is NoForm', () => {
      storeCurrentAction.set(ActionForms.NoForm);
      const { container } = render(ProviderActions);
      ['add-control-key', 'request-to-be-provider', 'create-provider', 'create-msa'].forEach((id) => {
        const el = container.querySelector(`#${id}`);
        expect(el).toBeNull();
      });
    });
    describe('Components are not hidden when currentAction is their action', () => {
      [
        { id: 'add-control-key', action: ActionForms.AddControlKey },
        { id: 'request-to-be-provider', action: ActionForms.RequestToBeProvider },
        { id: 'create-provider', action: ActionForms.CreateProvider },
        { id: 'create-msa', action: ActionForms.CreateMsa },
      ].forEach((component) => {
        it(`${component.id} is not hidden`, () => {
          storeCurrentAction.set(component.action);
          const { container } = render(ProviderActions);
          const el = container.querySelector(`#${component.id}`);
          expect(el).not.toHaveClass('hidden');
        });
      });
    });
  });
  describe('interaction with children', () => {
    beforeEach(() => {
      storeConnected.set(true);
      storeCurrentAction.set(ActionForms.NoForm);
      storeMsaInfo.set((info: MsaInfo) => (info = { isProvider: false, msaId: 0, providerName: '' }));
    });

    it('when they are a provider, AddControlKey can be clicked, then AddControlKey component is shown', async () => {
      transactionSigningAddress.set('does not matter');
      storeMsaInfo.update((info: MsaInfo) => (info = { ...info, isProvider: true, msaId: 99, providerName: 'Testy' }));
      let currentAction = ActionForms.NoForm;
      storeCurrentAction.subscribe((action) => (currentAction = action));
      const providerActions = render(ProviderActions);
      const actionButton = providerActions.getByRole('button', { name: 'Add control key' });
      expect(actionButton).toBeInTheDocument();
      userEvent.click(actionButton);
      await waitFor(() => {
        expect(currentAction).toEqual(ActionForms.AddControlKey);
        const expectedForm = providerActions.container.querySelector('#add-control-key');
        expect(expectedForm).toBeInTheDocument();
        expect(expectedForm).not.toHaveClass('hidden');
      });
    });
    describe('when connected to localhost', () => {
      beforeEach(() => {
        dotApi.update((api: DotApi) => (api = { ...api, selectedEndpoint: 'ws://localhost:9944' }));
      });
      describe('when a signing address is selected', () => {
        beforeEach(() => transactionSigningAddress.set('0xabcdbeef'));

        it("when they aren't an MSA or a provider, Create MSA can be clicked, then Create MSA component is shown", async () => {
          storeMsaInfo.update((info: MsaInfo) => (info = { isProvider: false, msaId: 0, providerName: '' }));
          let currentAction = ActionForms.NoForm;
          storeCurrentAction.subscribe((action) => (currentAction = action));
          const providerActions = render(ProviderActions);
          const actionButton = providerActions.getByRole('button', { name: 'Create an MSA' });
          expect(actionButton).toBeInTheDocument();
          userEvent.click(actionButton);
          await waitFor(() => {
            expect(currentAction).toEqual(ActionForms.CreateMsa);
            const expectedForm = providerActions.container.querySelector('#create-msa');
            expect(expectedForm).toBeInTheDocument();
            expect(expectedForm).not.toHaveClass('hidden');
          });
        });

        it("when they aren't a provider, Become Provider can be clicked, then Create Provider component is shown", async () => {
          storeMsaInfo.update((info: MsaInfo) => (info = { isProvider: false, msaId: 99, providerName: '' }));
          let currentAction = ActionForms.NoForm;
          storeCurrentAction.subscribe((action) => (currentAction = action));
          const providerActions = render(ProviderActions);
          const actionButton = providerActions.getByRole('button', { name: 'Become a Provider' });
          expect(actionButton).toBeInTheDocument();
          userEvent.click(actionButton);
          await waitFor(() => {
            expect(currentAction).toEqual(ActionForms.CreateProvider);
            const expectedForm = providerActions.container.querySelector('#create-provider');
            expect(expectedForm).toBeInTheDocument();
            expect(expectedForm).not.toHaveClass('hidden');
          });
        });
      });
    });
    describe('when connected to mainnet', () => {
      beforeEach(() => {
        dotApi.update((api: DotApi) => (api = { ...api, selectedEndpoint: 'wss://1.rpc.frequency.xyz' }));
      });
      describe('when a signing address is selected', () => {
        beforeEach(() => transactionSigningAddress.set('0xabcdbeef'));

        it("when they aren't an MSA or a provider, Create MSA can be clicked, then Create MSA component is shown", async () => {
          storeMsaInfo.update((info: MsaInfo) => (info = { isProvider: false, msaId: 0, providerName: '' }));
          let currentAction = ActionForms.NoForm;
          storeCurrentAction.subscribe((action) => (currentAction = action));
          const providerActions = render(ProviderActions);
          const actionButton = providerActions.getByRole('button', { name: 'Create an MSA' });
          expect(actionButton).toBeInTheDocument();
          userEvent.click(actionButton);
          await waitFor(() => {
            expect(currentAction).toEqual(ActionForms.CreateMsa);
            const expectedForm = providerActions.container.querySelector('#create-msa');
            expect(expectedForm).toBeInTheDocument();
            expect(expectedForm).not.toHaveClass('hidden');
          });
        });

        it("if they aren't a provider, Become Provider can be clicked, then Request to be provider is shown", async () => {
          storeMsaInfo.update((info: MsaInfo) => (info = { isProvider: false, msaId: 99, providerName: '' }));
          let currentAction = ActionForms.NoForm;
          storeCurrentAction.subscribe((action) => (currentAction = action));
          const providerActions = render(ProviderActions);
          const actionButton = providerActions.getByRole('button', { name: 'Become a Provider' });
          expect(actionButton).toBeInTheDocument();
          userEvent.click(actionButton);
          await waitFor(() => {
            expect(currentAction).toEqual(ActionForms.RequestToBeProvider);
            const expectedForm = providerActions.container.querySelector('#request-to-be-provider');
            expect(expectedForm).toBeInTheDocument();
            expect(expectedForm).not.toHaveClass('hidden');
          });
        });
      });
    });
  });
});
