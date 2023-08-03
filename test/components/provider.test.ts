import { cleanup, fireEvent, render } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import {
  dotApi,
  storeConnected,
  storeCurrentAction,
  storeProviderId, storeToken,
  transactionSigningAddress
} from '../../src/lib/stores';
import Provider from '$components/Provider.svelte';
import { ActionForms } from '../../src/lib/storeTypes';
import {waitFor} from "@testing-library/svelte";

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
  it('Says there is no provider if localProvider === 0', () => {
    storeConnected.set(true);
    const { container } = render(Provider);
    const main = container.querySelector('p');
    expect(main.innerHTML).toEqual('Selected Key is not associated with a Provider');
    expect(container.querySelector('button')).toBeNull();
  });
  it('Shows Provider Id if non-zero', () => {
    storeConnected.set(true);
    storeProviderId.set(11);
    const { container } = render(Provider);
    const main = container.querySelector('p');
    expect(main.innerHTML).toEqual('Id: 11');
  });
  it('updates storeCurrentAction when button is clicked', async () => {
    let currentAction: ActionForms = ActionForms.NoForm;
    storeCurrentAction.subscribe((v) => (currentAction = v));
    storeConnected.set(true);
    storeProviderId.set(11);
    const { getByText } = render(Provider);
    await fireEvent.click(getByText('Add control key'));
    expect(currentAction).toEqual(ActionForms.AddControlKey);
  });

  it('shows balances', async ()=> {
    const createdApi = await mocks.ApiPromise.create();
    storeConnected.set(true);
    storeProviderId.set(21);
    const { getByText} = render(Provider);
    await dotApi.update(val => val = {...val, api: createdApi});

    expect(getByText('Transferable: 0')).toBeInTheDocument();

    storeToken.set('FLARP');
    transactionSigningAddress.set('0xdeadbeef');

    await waitFor(() => {
      expect(getByText('Transferable: 100.0000 FLARP')).toBeInTheDocument();
      expect(getByText('Locked: 50.0000 FLARP')).toBeInTheDocument();
      expect(getByText('Total Balance: 150.0000 FLARP')).toBeInTheDocument();
    })
  })
});
