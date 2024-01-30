import { cleanup, render, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import {
  dotApi,
  storeConnected,
  storeCurrentAction,
  storeToken,
} from '../../src/lib/stores';
import { user } from '../../src/lib/stores/userStore';
import Provider from '$components/Provider.svelte';
import { ActionForms } from '../../src/lib/storeTypes';
import { getByTextContent } from '../helpers';

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
  return { ApiPromise: mocks.ApiPromise };
});

describe('Provider.svelte', () => {
  beforeEach(() => {
    storeCurrentAction.set(ActionForms.NoForm);
    user.set({ address: '', isProvider: false, msaId: 0, providerName: '' });
  });
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(Provider);
    expect(container).toBeInTheDocument();
  });

  it('shows not connected text if not connected', () => {
    storeConnected.set(false);
    const { getByText } = render(Provider);
    expect(getByText('Not connected')).toBeInTheDocument();
  });

  describe('once connected', () => {
    beforeAll(() => storeConnected.set(true));

    it('shows if you have not selected a signing address', () => {
      const { getByText } = render(Provider);
      expect(getByText('No transaction signing address selected')).toBeInTheDocument();
    });

    describe("if they don't have an MSA", () => {
      beforeEach(() => {
        user.set({ address: '0xabcd1234', isProvider: false, msaId: 0, providerName: '' });
        storeToken.set('FLARP');
      });

      it('says you should create an msa', () => {
        const { container } = render(Provider);
        const result = getByTextContent('No Msa Id. Please create an MSA first.');
        expect(result).toBeInTheDocument();
        expect(container.querySelector('button')).toBeNull();
      });

      it('still shows balances', async () => {
        const createdApi = await mocks.ApiPromise.create();

        dotApi.update((val) => (val = { ...val, api: createdApi }));
        render(Provider);
      });
    });

    describe('if they are not a provider', () => {
      beforeEach(() => {
        user.set({ address: '0xcoffee', isProvider: false, msaId: 11, providerName: '' });
        storeToken.set('FLARP');
        // to get rid of an extraneous error
        dotApi.update((api) => (api = { ...api, selectedEndpoint: 'ws://localhost:9944' }));
      });

      it('still shows balances', async () => {
        const createdApi = await mocks.ApiPromise.create();

        await dotApi.update((val) => (val = { ...val, api: createdApi }));
        render(Provider);

        expect(getByTextContent('Transferable 0')).toBeInTheDocument();
        await waitFor(() => {
          // these values are from the mocks
          expect(getByTextContent('Total Balance 1.5000 micro FLARP')).toBeInTheDocument();
          expect(getByTextContent('Transferable 1.0000 micro FLARP')).toBeInTheDocument();
          expect(getByTextContent('Locked 50.0000 nano FLARP')).toBeInTheDocument();
        });
      });
    });
    describe('when they are a Provider', () => {
      beforeEach(() => {
        user.set({ address: '0xdeadbeef', isProvider: true, msaId: 11, providerName: 'Bobbay' });
      });

      it('Shows Provider Id and name', () => {
        render(Provider);
        expect(getByTextContent('Id 11')).toBeInTheDocument();
        expect(getByTextContent('Name Bobbay')).toBeInTheDocument();
      });
    });
  });
});
