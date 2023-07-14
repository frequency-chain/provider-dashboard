<script>
    import {storeConnected, transactionSigningAddress, dotApi} from "$lib/stores";
    import {firstValueFrom} from "rxjs";
    let connected;
    storeConnected.subscribe((val) => connected = val);
    let thisDotApi;
    dotApi.subscribe(api => {
        console.info("dotApi subscribe");
        thisDotApi = api;
        console.info(thisDotApi.api.isReady)
    });


    let capacityDetails = {
        remaining_capacity:      0n,
        total_tokens_staked:   0n,
        total_capacity_issued:   0n,
        last_replenished_epoch: 0n
    };

    let signingAddress = ""
    transactionSigningAddress.subscribe(async (addr) => {
        console.log("txn signing addr subscribe")
        signingAddress = addr;
        if (connected && thisApi.isReady) {
            const providerId = await thisApi.query.msa.publicKeyToMsaId(addr);
            const details = await firstValueFrom(thisApi.query.capacity.capacityLedger(providerId));
            console.info({details})
            capacityDetails = details;
        }
    });
    export let token;
</script>
<style>
    .hidden {
        display: none;
    }
</style>

<div class={connected ? "" : "hidden"}>
    <h3>Capacity</h3>
    <p><strong>Remaining:</strong> {capacityDetails.remaining_capacity}</p>
    <p><strong>Total Issued:</strong> {capacityDetails.total_capacity_issued}</p>
    <p><strong>Last replenished:</strong> Epoch {capacityDetails.last_replenished_epoch}</p>
    <p><strong>Staked Token:</strong> {capacityDetails.total_capacity_issued} {token}</p>
</div>