import {vi} from "vitest";

export type MocksFactoryOptions = {
    epochNumber?: number;
    blockNumber?: number;
}

export const buildMocksWith = (): Record<string, any> => {
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
    const epochNumber = new TestCodec(55);
    const blockData = {
        block: { header: { number: new TestCodec(22) } },
    };

    class TestCapacityDetails {
        remainingCapacity: TestCodec;
        totalTokensStaked: TestCodec;
        totalCapacityIssued: TestCodec;
        lastReplenishedEpoch: TestCodec;

        constructor(rc: number, tts: number, tci: number, lre: number) {
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
    const capacityDetails: TestCapacityDetails =  new TestCapacityDetails(501, 5000, 1000, 59);

    const resolvedCurrentEpochChain = {
        isReady: vi.fn().mockResolvedValue(true),
        query: {
            capacity: {
                currentEpoch: vi.fn().mockResolvedValue(epochNumber),
                capacityLedger: vi.fn().mockResolvedValue(capacityDetails)
            },
            msa: {
                publicKeyToMsaId: vi.fn().mockResolvedValue(new TestCodec(3))
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
}
