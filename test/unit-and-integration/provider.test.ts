import { cleanup, render } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import { storeChainInfo } from '../../src/lib/stores';
import { user } from '../../src/lib/stores/userStore';
import Provider from '$components/Provider.svelte';
import { getByTextContent } from '../helpers';
import { KeyringPair } from '@polkadot/keyring/types';
import Keyring from '@polkadot/keyring';
import { vi } from 'vitest';
import { waitReady } from '@polkadot/wasm-crypto';

await waitReady();

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

  const mockApiPromise: any = vi.fn();
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
    user.set({ address: '', isProvider: false, msaId: 0, providerName: '' });
  });
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(Provider);
    expect(container).toBeInTheDocument();
  });

  describe('once connected', () => {
    beforeAll(() => storeChainInfo.update((info) => (info = { ...info, connected: true })));

    describe('when they are a Provider', () => {
      beforeEach(() => {
        const keyring = new Keyring({ type: 'sr25519' });
        const keyRingPair: KeyringPair = { ...keyring.addFromUri('//Alice'), ...{ meta: { name: '//Alice' } } };
        user.set({
          address: '0xdeadbeef',
          isProvider: true,
          msaId: 11,
          providerName: 'Bobbay',
          signingKey: keyRingPair,
        });
      });

      it('Shows Provider Id and name', () => {
        render(Provider);
        expect(getByTextContent('Id 11')).toBeInTheDocument();
        expect(getByTextContent('Name Bobbay')).toBeInTheDocument();
      });
    });
  });
});
