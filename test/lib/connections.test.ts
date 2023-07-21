import {getEpoch, submitAddControlKey, getBlockNumber, signPayloadWithKeyring} from "../../src/lib/connections";
import {expect, test, describe} from "vitest";
import {ApiPromise} from "@polkadot/api";
import {Keyring} from "@polkadot/keyring";
import {isFunction} from "@polkadot/util";

const mocks = vi.hoisted(() => {
    // this has to be inside here because otherwise the error will be
    // 'Cannot access TestCodec before initialization'

    class TestCodec {
        value: bigint;
        constructor(val: bigint) {
            this.value = val;
        }
        toBigInt(): bigint { return this.value; }
    }
    const mockApiPromise = vi.fn();
    const epochNumber = new TestCodec(101n);
    let blockData = {
        block: { header: {number: new TestCodec(1001n)} }
    }
    const resolvedCurrentEpochChain = {
        isReady: vi.fn().mockResolvedValue(true),
        query: { capacity: { currentEpoch: vi.fn().mockResolvedValue(epochNumber) } },
        rpc: { chain: { getBlock: vi.fn().mockResolvedValue(blockData) }},
    };
    mockApiPromise.create = vi.fn().mockResolvedValue(resolvedCurrentEpochChain)

    const mockExtension = vi.fn();
    return {
        ApiPromise: mockApiPromise,
        InjectedExtension: mockExtension
    };
})

vi.mock('@polkadot/api', async ()=> {
    return { ApiPromise: mocks.ApiPromise };
});
vi.mock('@polkadot/extension-inject/types', async () => {
    return { InjectedExtension: mocks.InjectedExtension }
})
describe('getEpoch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })
    test("getEpoch works", async () => {
        let mockApi = await ApiPromise.create();
        let ce = await getEpoch(mockApi);
        expect(ce).toBe(101n);
    })
})

describe('getBlockNumber', () => {
    beforeEach(() => vi.clearAllMocks() )

    test('getBlockNumber works', async () => {
        let mockApi = await ApiPromise.create();
        let bn = await getBlockNumber(mockApi);
        expect(bn).toBe(1001n);
    })
})
describe('submitAddControlKey', async () => {
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri("//Alice")
    const bob = keyring.addFromUri('//Bob');

   it('calls signPayloadWithKeyring when localhost',async () => {
       let mockFn = vi.fn();
       vi.doMock("../../src/lib/connections", () =>
           ({ signPayloadWithKeyring: mockFn })
       );
       const api = await ApiPromise.create();
       const extension = undefined;
       const callback = vi.fn();
       const providerId = 4;
       const endpointURL = "ws://localhost:9944"

       await submitAddControlKey(api, extension, bob, alice, providerId, endpointURL, callback);
    })
});
