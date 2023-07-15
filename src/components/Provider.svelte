<script lang="ts">
    import {providerId, storeConnected} from "$lib/stores";

    let localProvider = 0;
    providerId.subscribe(val => localProvider = val);

</script>
<div class={storeConnected ? "" : "hidden"}>
    {#if !localProvider}
        <h3>Provider Id</h3>
        <p>Selected Key is not associated with a Provider</p>
    {:else}
        <h3>Provider Id: {localProvider}</h3>
    {/if}
</div>