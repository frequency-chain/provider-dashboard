<script lang="ts">
    import { options } from "@frequency-chain/api-augment";
    import {storeConnected, transactionSigningAddress, dotApi} from "$lib/stores";
    import {defaultDotApi} from "$lib/storeTypes";
    import { u16, u32, u64, Option } from "@polkadot/types";
    let connected;
    let providerId = 0;
    storeConnected.subscribe((val) => connected = val);
    let thisDotApi = defaultDotApi;
    dotApi.subscribe(api => {
        thisDotApi = api;
    });

    let capacityDetails = {
        remainingCapacity:  0n,
        totalTokensStaked:   0n,
        totalCapacityIssued:   0n,
        lastReplenishedEpoch: 0n
    };

    let signingAddress = ""
    transactionSigningAddress.subscribe(async (addr) => {
        if (!!addr) {
            signingAddress = addr;
            if (connected && thisDotApi.api.query) {
                let api = thisDotApi?.api;
                const received: u64 = (await api.query.msa.publicKeyToMsaId(addr)).unwrapOrDefault();
                providerId = received.toNumber();
                if (providerId > 0) {
                    const details: Option<any> = (await api.query.capacity.capacityLedger(providerId)).unwrapOrDefault();
                    capacityDetails = {
                        remainingCapacity: details.remainingCapacity.toBigInt(),
                        totalTokensStaked: details.totalTokensStaked.toBigInt(),
                        totalCapacityIssued: details.totalCapacityIssued.toBigInt(),
                        lastReplenishedEpoch: details.lastReplenishedEpoch.toBigInt(),
                    };
                }
            }
        }
    });
    export let token;

</script>
<style>
    .hidden {
        display: none;
    }
</style>
<div>Provider Id: {providerId}</div>
<div class={ providerId > 0 ? "" : "hidden"}>
    <h3>Capacity</h3>
    <p><strong>Remaining:</strong> {capacityDetails.remainingCapacity}</p>
    <p><strong>Total Issued:</strong> {capacityDetails.totalCapacityIssued}</p>
    <p><strong>Last replenished:</strong> Epoch {capacityDetails.lastReplenishedEpoch}</p>
    <p><strong>Staked Token:</strong> {capacityDetails.totalCapacityIssued} {token}</p>
</div>