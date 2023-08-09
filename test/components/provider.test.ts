import {cleanup, fireEvent, render, waitFor} from '@testing-library/svelte';
import '@testing-library/jest-dom';
import {
  dotApi,
  storeConnected,
  storeCurrentAction,
  storeMsaInfo,
  storeToken,
  transactionSigningAddress
} from '../../src/lib/stores';
import Provider from '$components/Provider.svelte';
import {ActionForms, DotApi, MsaInfo} from '../../src/lib/storeTypes';

const defaultMsaInfo: MsaInfo = {
  isProvider: false, msaId: 0, providerName: ''
}

const mocks =  vi.hoisted(() => {
  class TestCodec {
    value: number;
    constructor(val: number) {
      this.value = val;
    }
    toBigInt(): bigint {
      return BigInt(this.value);
    }
    toNumber(): number {
      return this.value;
    }
    unwrapOrDefault(): TestCodec {
      return this;
    }
  }
  class TestBalances {
    data: {
      free: TestCodec;
      frozen: TestCodec;
      reserved: TestCodec;
    }

    constructor(free: number, frozen: number, reserved: number) {
      this.data = {
        free: new TestCodec(free),
        frozen: new TestCodec(frozen),
        reserved: new TestCodec(reserved),
      }
    }

    unwrapOrDefault(): TestBalances {
      return this;
    }
  }

  const testBalances = new TestBalances(100, 50, 5);
  const resolvedApi = {
    isReady: vi.fn().mockResolvedValue(true),
    query: {
      system: {
        account: vi.fn().mockResolvedValue(testBalances)
      }
    },
  };

  const mockApiPromise = vi.fn();
  mockApiPromise.create = vi.fn().mockResolvedValue(resolvedApi);

  const mockWeb3FromSource = vi.fn();
  return {
    ApiPromise: mockApiPromise,
    web3FromSource: mockWeb3FromSource,
  };

});

vi.mock('@polkadot/api', async () => {
  return { ApiPromise: mocks.ApiPromise };
});

describe('Provider.svelte', () => {
  afterEach(() => cleanup());
  beforeEach( () => {
    storeCurrentAction.set(ActionForms.NoForm);
    storeMsaInfo.set({ isProvider: false, msaId: 0, providerName: ''})
  })
  it('mounts', () => {
    const { container } = render(Provider);
    expect(container).toBeInTheDocument();
  });

  it('is hidden if not connected', () => {
    storeConnected.set(false);
    const { container } = render(Provider);
    const main = container.querySelector('div div');
    expect(main).toHaveClass('hidden');
  });
  it('is not hidden if connected', () => {
    storeConnected.set(true);
    const { container } = render(Provider);
    const main = container.querySelector('div div');
    expect(main.classList.length).toEqual(0);
  });

  describe("once connected", () => {

    beforeAll(() => storeConnected.set(true) )
    describe("if they don't have an MSA", () => {
      beforeEach(() => {
        storeMsaInfo.update((info: MsaInfo) => info = {...info, isProvider: false, msaId: 0});
      })
      it("says you should create an msa", () => {
        const { container } = render(Provider);
        const main = container.querySelector('p');
        expect(main.innerHTML).toEqual('No Msa Id. Please create an MSA first.');
        expect(container.querySelector('button')).toBeNull();
      })
      it("still shows balances", async () => {
        const createdApi = await mocks.ApiPromise.create();

        dotApi.update(val => val = {...val, api: createdApi});
        const {getByText} = render(Provider);

        expect(getByText('Transferable: 0')).toBeInTheDocument();
        waitFor(() => {
          // these values are from the mocks
          expect(getByText('Transferable: 100.0000 FLARP')).toBeInTheDocument();
          expect(getByText('Locked: 50.0000 FLARP')).toBeInTheDocument();
          expect(getByText('Total Balance: 150.0000 FLARP')).toBeInTheDocument();
        })

      })
    });

    describe("if they have an MSA Id but aren't a provider", () => {
      beforeEach(() => {
        storeMsaInfo.update((info: MsaInfo) => info = {...info, isProvider: false, msaId: 11});
      })
      it('tells you if you have not selected a signing transaction key', async () => {
        const { container } = render(Provider);
        await waitFor(() => {
          const main = container.querySelector('p');
          expect(main.innerHTML).toEqual('No transaction signing address selected');
          expect(container.querySelector('button')).toBeNull();
        })
      });

      describe("and they have selected a signing address", () => {

        beforeEach(() => {
          transactionSigningAddress.set('0xabcdbeef');
          storeToken.set('FLARP');
          // to get rid of an extraneous error
          dotApi.update(api => api = {...api, selectedEndpoint: "ws://localhost:9944"})
        })

        it('Says there is no provider and shows Become a Provider button', () => {
          const { container, getByRole } = render(Provider);
          const main = container.querySelector('p');
          expect(main.innerHTML).toEqual('Selected Key is not associated with a Provider');
          expect(getByRole('button', {name: "Become a Provider"})).toBeInTheDocument();
        });
        it('shows balances', async ()=> {
          const createdApi = await mocks.ApiPromise.create();

          await dotApi.update(val => val = {...val, api: createdApi});
          const {getByText} = render(Provider);

          expect(getByText('Transferable: 0')).toBeInTheDocument();
          await waitFor(() => {
            // these values are from the mocks
            expect(getByText('Transferable: 100.0000 FLARP')).toBeInTheDocument();
            expect(getByText('Locked: 50.0000 FLARP')).toBeInTheDocument();
            expect(getByText('Total Balance: 150.0000 FLARP')).toBeInTheDocument();
          })
        });
        it("clicking Become Provider sets the action forms to RequestToBeProvider, if on Mainnet", async () => {
          dotApi.update((api: DotApi) => api = {...api, selectedEndpoint: 'wss://0.rpc.frequency.xyz'});
          let currentAction;
          storeCurrentAction.subscribe((action) => currentAction = action);

          const {getByRole} = render(Provider);

          const becomeProviderButton = getByRole('button', {name: "Become a Provider"});
          fireEvent.click(becomeProviderButton);
          await waitFor(() => {
            expect(currentAction).toEqual(ActionForms.RequestToBeProvider);
          })
        });

      });
    });
    describe('when they are a Provider', () => {
      it('Shows Provider Id', () => {
        storeMsaInfo.update((info: MsaInfo) => info = {...info, isProvider: true, msaId: 11});
        const { container } = render(Provider);
        const main = container.querySelector('p');
        expect(main.innerHTML).toEqual('Id: 11');
      });
      it('updates storeCurrentAction when button is clicked', async () => {
        let currentAction: ActionForms = ActionForms.NoForm;
        storeCurrentAction.subscribe((v) => (currentAction = v));
        storeMsaInfo.update((info: MsaInfo) => info = {...info, isProvider: true, msaId: 11});
        const { getByText } = render(Provider);
        fireEvent.click(getByText('Add control key'));
        expect(currentAction).toEqual(ActionForms.AddControlKey);
      });


    })
  })
});
