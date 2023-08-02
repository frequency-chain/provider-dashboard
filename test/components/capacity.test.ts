import {cleanup, render, waitFor} from '@testing-library/svelte';
import { getEpoch, getBlockNumber } from '$lib/connections';
import type { ApiPromise } from '@polkadot/api';
import '@testing-library/jest-dom';
import {storeConnected, storeProviderId, transactionSigningAddress, dotApi} from "../../src/lib/stores";
import Capacity from '$components/Capacity.svelte';
import {TypeRegistry} from "@polkadot/types";
import { Option, U64 } from "@polkadot/types-codec";
import {Test} from "vitest";

const mocks =  vi.hoisted(() => {
  class TestCodec {
    value: bigint;
    constructor(val: bigint) {
      this.value = val;
    }
    toBigInt(): bigint {
      return this.value;
    }
    toNumber(): number {
      return this.value as number;
    }
    unwrapOrDefault(): TestCodec {
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
  const capacityDetails: TestCapacityDetails =  new TestCapacityDetails(501n, 5000n, 1000n, 59n);

  const resolvedCurrentEpochChain = {
    isReady: vi.fn().mockResolvedValue(true),
    query: {
      capacity: {
        currentEpoch: vi.fn().mockResolvedValue(epochNumber),
        capacityLedger: vi.fn().mockResolvedValue(capacityDetails)
      },
      msa: {
        publicKeyToMsaId: vi.fn().mockResolvedValue(new TestCodec(3n))
      }
    },
    rpc: { chain: { getBlock: vi.fn().mockResolvedValue(blockData) } },
    tx: { msa: { addPublicKeyToMsa: vi.fn().mockResolvedValue(undefined) } },
  };

  const mockApiPromise = vi.fn();
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
  });
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(Capacity, {token: 'TEST'});
    expect(container).toBeInTheDocument();
  });

  it('is hidden if the provider id === 0 and shows otherwise', () => {
      const { container } = render(Capacity, {token: 'TEST'});
      expect(container.querySelector('div div')).toHaveClass('hidden');
  });

  it('is shown when there is a provider id', async () => {
    const { container, debug } = render(Capacity, {token: "XFRQCY"})
    const createdApi = await mocks.ApiPromise.create();
    await dotApi.update(val => val = {...val, api: createdApi});
    await storeConnected.set(true);
    await transactionSigningAddress.set("0xabcdef0000");
    await waitFor( () => {
      expect(container.querySelector('div div')).not.toHaveClass('hidden')
    })
  })
});
