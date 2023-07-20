<script lang="ts">
    import {storeProviderId, storeConnected} from "$lib/stores";
    import {ActionForms} from "$lib/storeTypes";
    import {storeCurrentAction} from "$lib/stores.js";

    let localProvider = 0;
    storeProviderId.subscribe(val => localProvider = val);
    let connected = false;
    storeConnected.subscribe(val => connected = val);

    function showAddControlKey() {
        storeCurrentAction.update(val => val = ActionForms.AddControlKey);
    }

</script>
<div class={connected ? "" : "hidden"}>
    <h3>Provider</h3>
    {#if !localProvider}
        <p>Selected Key is not associated with a Provider</p>
    {:else}
        <p>Id: {localProvider}</p>
        <button on:click={showAddControlKey}>Add control key</button>
    {/if}
</div>