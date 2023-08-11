import {cleanup, fireEvent, render, waitFor} from '@testing-library/svelte';
import '@testing-library/jest-dom';
import {
  dotApi,
  storeConnected,
  storeCurrentAction,
  storeMsaInfo,
  storeToken,
  transactionSigningAddress,
} from '../../src/lib/stores';
import Provider from '$components/Provider.svelte';
import {ActionForms, DotApi, MsaInfo} from '../../src/lib/storeTypes';

const mocks = vi.hoisted(() => {
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
    };

    constructor(free: number, frozen: number, reserved: number) {
      this.data = {
        free: new TestCodec(free),
        frozen: new TestCodec(frozen),
        reserved: new TestCodec(reserved),
      };
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
        account: vi.fn().mockResolvedValue(testBalances),
      },
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
  return {ApiPromise: mocks.ApiPromise};
});

describe('Provider.svelte', () => {
  beforeEach(() => {
    storeCurrentAction.set(ActionForms.NoForm);
    storeMsaInfo.set({isProvider: false, msaId: 0, providerName: ''});
  });
  afterEach(() => cleanup());

  it('mounts', () => {
    const {container} = render(Provider);
    expect(container).toBeInTheDocument();
  });

  it('shows not connected text if not connected', () => {
    storeConnected.set(false);
    const {getByText} = render(Provider);
    expect(getByText('Not connected')).toBeInTheDocument();
  });

  describe('once connected', () => {
    beforeAll(() => storeConnected.set(true));

    it('shows if you have not selected a signing address', () => {
      const {getByText} = render(Provider);
      expect(getByText('No transaction signing address selected')).toBeInTheDocument();
    });

    describe("if they don't have an MSA", () => {
      beforeEach(() => {
        transactionSigningAddress.set('0xabcd1234');
        storeMsaInfo.set({providerName: '', isProvider: false, msaId: 0});
        storeToken.set('FLARP');
      });

      it('says you should create an msa', () => {
        const {container} = render(Provider);
        const main = container.querySelector('p');
        expect(main.innerHTML).toEqual('No Msa Id. Please create an MSA first.');
        expect(container.querySelector('button')).toBeNull();
      });

      it('still shows balances', async () => {
        const createdApi = await mocks.ApiPromise.create();

        dotApi.update((val) => (val = {...val, api: createdApi}));
        const {getByText} = render(Provider);

        await waitFor(() => {
          expect(getByText('Transferable: 10.0000 nano FLARP')).toBeInTheDocument();
          expect(getByText('Locked: 5.0000 nano FLARP')).toBeInTheDocument();
          expect(getByText('Total Balance: 15.0000 nano FLARP')).toBeInTheDocument();
        });
      });
    });

    describe("if they are not a provider", () => {
      beforeEach(() => {
        transactionSigningAddress.set('0xcoffee');
        storeMsaInfo.set({providerName: '', isProvider: false, msaId: 11});
        storeToken.set('FLARP');
        // to get rid of an extraneous error
        dotApi.update((api) => (api = {...api, selectedEndpoint: 'ws://localhost:9944'}));
      });
      it('Says there is no provider and shows Become a Provider button', () => {
        const {getByText, getByRole} = render(Provider);
        expect(getByText('Selected Key is not associated with a Provider')).toBeInTheDocument();
        expect(getByRole('button', {name: 'Become a Provider'})).toBeInTheDocument();
      });

      it('still shows balances', async () => {
        const createdApi = await mocks.ApiPromise.create();

        await dotApi.update((val) => (val = {...val, api: createdApi}));
        const {getByText} = render(Provider);

        expect(getByText('Transferable: 0')).toBeInTheDocument();
        await waitFor(() => {
          // these values are from the mocks
          expect(getByText('Total Balance: 15.0000 nano FLARP')).toBeInTheDocument();
          expect(getByText('Transferable: 10.0000 nano FLARP')).toBeInTheDocument();
          expect(getByText('Locked: 5.0000 nano FLARP')).toBeInTheDocument();
        });
      });

      it('clicking Become Provider sets the action forms to RequestToBeProvider, if on Mainnet', async () => {
        dotApi.update((api: DotApi) => (api = {...api, selectedEndpoint: 'wss://0.rpc.frequency.xyz'}));
        let currentAction;
        storeCurrentAction.subscribe((action) => (currentAction = action));

        const {getByRole} = render(Provider);

        const becomeProviderButton = getByRole('button', {name: 'Become a Provider'});
        fireEvent.click(becomeProviderButton);
        await waitFor(() => {
          expect(currentAction).toEqual(ActionForms.RequestToBeProvider);
        });
      });
    });
    describe('when they are a Provider', () => {
      beforeEach(() => {
        transactionSigningAddress.set('anything');
        storeMsaInfo.set({providerName: "Bobbay", isProvider: true, msaId: 11});
      });

      it('Shows Provider Id and name', () => {
        const {getByText} = render(Provider);
        expect(getByText('Id: 11')).toBeInTheDocument();
        expect(getByText('Name: Bobbay')).toBeInTheDocument();
      });

      it('updates storeCurrentAction when button is clicked', async () => {
        let currentAction: ActionForms = ActionForms.NoForm;
        storeCurrentAction.subscribe((v) => (currentAction = v));
        storeMsaInfo.update((info: MsaInfo) => (info = {...info, isProvider: true, msaId: 11}));
        const {getByText} = render(Provider);
        fireEvent.click(getByText('Add control key'));
        expect(currentAction).toEqual(ActionForms.AddControlKey);
      });
    });
  });
});
