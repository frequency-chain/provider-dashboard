import Capacity from '$features/Capacity/Capacity.svelte';
import { dotApi, storeChainInfo } from '$lib/stores';
import { user } from '$lib/stores/userStore';
import { ChainInfo } from '$lib/storeTypes';
import Keyring from '@polkadot/keyring';
import '@testing-library/jest-dom';
import { cleanup, render, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';

const mocks = vi.hoisted(() => {
  class TestCodec {
    value: bigint;
    constructor(val: bigint) {
      this.value = val;
    }
    toBigInt(): bigint {
      return this.value;
    }
    toNumber(): number {
      return Number(this.value);
    }
    unwrapOrDefault(): TestCodec {
      return this;
    }
  }

  class TestProviderRegistry {
    providerName: string;
    isSome: boolean;
    constructor(val: string) {
      this.providerName = val;
      this.isSome = val !== '';
    }
    unwrap(): TestProviderRegistry {
      return this;
    }
  }

  const epochNumber = new TestCodec(122n);
  const blockData = {
    block: { header: { number: new TestCodec(1021n) } },
  };

  class TestCapacityDetails {
    remainingCapacity: TestCodec;
    totalTokensStaked: TestCodec;
    totalCapacityIssued: TestCodec;
    lastReplenishedEpoch: TestCodec;

    constructor(rc: bigint, tts: bigint, tci: bigint, lre: bigint) {
      this.remainingCapacity = new TestCodec(rc);
      this.totalTokensStaked = new TestCodec(tts);
      this.totalCapacityIssued = new TestCodec(tci);
      this.lastReplenishedEpoch = new TestCodec(lre);
    }

    unwrapOrDefault(): TestCapacityDetails {
      return this;
    }
  }

  // set up capacity details response
  const capacityDetails: TestCapacityDetails = new TestCapacityDetails(501n, 5000n, 1000n, 59n);

  const resolvedCurrentEpochChain = {
    isReady: vi.fn().mockResolvedValue(true),
    query: {
      capacity: {
        currentEpoch: vi.fn().mockResolvedValue(epochNumber),
        capacityLedger: vi.fn().mockResolvedValue(capacityDetails),
      },
      msa: {
        publicKeyToMsaId: vi.fn().mockResolvedValue(new TestCodec(3n)),
        providerToRegistryEntry: vi.fn().mockResolvedValue(new TestProviderRegistry('Bobbay')),
      },
    },
    rpc: { chain: { getBlock: vi.fn().mockResolvedValue(blockData) } },
    tx: { msa: { addPublicKeyToMsa: vi.fn().mockResolvedValue(undefined) } },
  };

  const mockApiPromise: any = vi.fn();
  mockApiPromise.create = vi.fn().mockResolvedValue(resolvedCurrentEpochChain);

  const mockWeb3FromSource = vi.fn();
  return {
    ApiPromise: mockApiPromise,
    web3FromSource: mockWeb3FromSource,
  };
});

vi.mock('@polkadot/api', async () => {
  return { ApiPromise: mocks.ApiPromise };
});

describe('Capacity.svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    user.set({ address: '', isProvider: false, msaId: 0, providerName: '' });
  });
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(Capacity);
    expect(container).toBeInTheDocument();
  });

  describe('if connected to an endpoint', () => {
    beforeAll(async () => {
      storeChainInfo.update((val: ChainInfo) => (val = { ...val, connected: true }));
    });

    beforeEach(async () => {
      user.set({ address: '', isProvider: false, msaId: 0, providerName: '' });
    });

    it('if address is not selected it says so', () => {
      const { getByText } = render(Capacity);
      expect(getByText('No transaction signing address selected')).toBeInTheDocument();
    });

    it('is shown if it isProvider is true', async () => {
      const { container } = render(Capacity);
      user.update((u) => (u = { ...u, isProvider: true }));
      await waitFor(() => {
        expect(container.querySelector('div div')).not.toHaveClass('hidden');
      });
    });
  });

  describe('integration: transactionSigningAddress.subscribe function', () => {
    beforeAll(async () => {
      storeChainInfo.update((val: ChainInfo) => (val = { ...val, connected: true }));
    });
    // Also this depends on set-in-stone __mocks__ which will return the address as a Provider
    it('Capacity elements are shown when selected transaction address, with MSA and is a Provider', async () => {
      // render component first
      const createdApi = await mocks.ApiPromise.create();
      const { container } = render(Capacity);

      // trigger changes as if user clicked Connect and such
      await dotApi.update((val) => (val = { ...val, api: createdApi }));
      user.update((u) => (u = { ...u, address: '0xdeadbeef' }));
      await waitFor(() => {
        expect(container.querySelector('div div')).not.toHaveClass('hidden');
      });
    });

    it('Shows the expected values for Capacity, block and epoch', async () => {
      // render component first
      const createdApi = await mocks.ApiPromise.create();
      const { getByText } = render(Capacity);

      // trigger changes as if user clicked Connect and such
      await dotApi.update((val) => (val = { ...val, api: createdApi }));
      // transactionSigningAddress.set('0xf00bead');
      user.set({
        address: '0x1234',
        isProvider: true,
        msaId: null,
        providerName: 'Alice',
        injectedAccount: {
          address: '0x1234',
          meta: {
            genesisHash: '1234',
            name: 'Alice',
            source: 'polkadot-js',
          },
        },
        keyringPair: new Keyring({ type: 'sr25519' }).addFromUri('//Alice'),
      });
      waitFor(() => {
        expect(getByText('No MSA ID.  Please create one.')).toBeDefined();
      });
    });

    it('Shows the expected values for Capacity, block and epoch', async () => {
      // render component first
      const createdApi = await mocks.ApiPromise.create();
      const { container, getByText } = render(Capacity, { token: 'FLARP' });

      // trigger changes as if user clicked Connect and such
      await dotApi.update((val) => (val = { ...val, api: createdApi }));
      // transactionSigningAddress.set('0xf00bead');
      user.set({
        address: '0x1234',
        isProvider: true,
        msaId: 1234,
        providerName: 'Alice',
        injectedAccount: {
          address: '0x1234',
          meta: {
            genesisHash: '1234',
            name: 'Alice',
            source: 'polkadot-js',
          },
        },
        keyringPair: new Keyring({ type: 'sr25519' }).addFromUri('//Alice'),
      });
      await waitFor(() => {
        expect(getByText('Remaining')).toBeInTheDocument();
        expect(getByText('5.0100 micro CAP')).toBeInTheDocument();

        expect(getByText('Total Issued')).toBeInTheDocument();
        expect(getByText('10.0000 micro CAP')).toBeInTheDocument();

        expect(getByText('Last Replenished')).toBeInTheDocument();
        expect(getByText('Epoch 59')).toBeInTheDocument();

        expect(getByText('Staked Token')).toBeInTheDocument();
        expect(getByText('50.0000 micro')).toBeInTheDocument();
      });
    });
  });
});
