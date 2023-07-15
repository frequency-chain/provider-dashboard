<script lang="ts">
    import {storeConnected, transactionSigningAddress, dotApi, providerId} from "$lib/stores";
    import {defaultDotApi} from "$lib/storeTypes";
    import { u16, u32, u64, Option } from "@polkadot/types";
    let connected;
    let localProviderId = 0;
    storeConnected.subscribe((val) => connected = val);
    let thisDotApi = defaultDotApi;
    dotApi.subscribe(api => {
        thisDotApi = api;
    });

    type CapacityDetails = { remainingCapacity: bigint, totalTokensStaked: bigint, totalCapacityIssued: bigint, lastReplenishedEpoch: bigint};
    const defaultDetails: CapacityDetails = {
        remainingCapacity: 0n,
        totalCapacityIssued: 0n,
        totalTokensStaked: 0n,
        lastReplenishedEpoch: 0n};

    let capacityDetails: CapacityDetails = defaultDetails;

    let signingAddress = ""
    transactionSigningAddress.subscribe(async (addr) => {
        signingAddress = addr;
        localProviderId = 0;
        capacityDetails = defaultDetails;
        if (connected && thisDotApi.api.query && !!addr) {
            let api = thisDotApi?.api;
            const received: u64 = (await api.query.msa.publicKeyToMsaId(addr)).unwrapOrDefault();
            localProviderId = received.toNumber();
            if (localProviderId > 0) {
                const details: Option<any> = (await api.query.capacity.capacityLedger(localProviderId)).unwrapOrDefault();
                capacityDetails = {
                    remainingCapacity: details.remainingCapacity.toBigInt(),
                    totalTokensStaked: details.totalTokensStaked.toBigInt(),
                    totalCapacityIssued: details.totalCapacityIssued.toBigInt(),
                    lastReplenishedEpoch: details.lastReplenishedEpoch.toBigInt(),
                };
            }
        }
        providerId.update(val => val = localProviderId)
    });
    export let token;

</script>
<style>
    .hidden {
        display: none;
    }
</style>
<div class={ localProviderId > 0 ? "" : "hidden"}>
    <h3>Capacity</h3>
    <p><strong>Remaining:</strong> {capacityDetails.remainingCapacity}</p>
    <p><strong>Total Issued:</strong> {capacityDetails.totalCapacityIssued}</p>
    <p><strong>Last replenished:</strong> Epoch {capacityDetails.lastReplenishedEpoch}</p>
    <p><strong>Staked Token:</strong> {capacityDetails.totalCapacityIssued} {token}</p>
</div>