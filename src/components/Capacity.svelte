<script>
    import {storeConnected} from "$lib/stores";
    let connected;
    storeConnected.subscribe((val) => connected = val);
    let capacityDetails = {
        remaining_capacity:      8974233n,
        total_tokens_staked:   500000000n,
        total_capacity_issued:   1000000n,
        last_replenished_epoch: 12445n
    };
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