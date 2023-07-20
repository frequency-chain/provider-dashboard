<script lang="ts">
    export let showSelf=false;
    export let statuses: Array<string> = [];

    const hideSelf = (evt: Event) => {
        evt.preventDefault();
        showSelf = false;
    }
</script>
<div class:hidden={!showSelf}>
    <h3>Transaction status</h3>
    <ul>
        {#each statuses as status}
            <li>{@html status}</li>
        {/each}
    </ul>
    <button on:click={hideSelf}>I'm done here</button>
</div>