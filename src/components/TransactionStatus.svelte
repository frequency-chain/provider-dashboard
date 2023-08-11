<script lang="ts">
  export let showSelf = false;
  export let statuses: Array<string> = [];

  const hideSelf = (evt: Event) => {
    evt.preventDefault();
    showSelf = false;
  };
</script>

<div class:hidden={!showSelf} id="transaction-status">
  <h3>Transaction status</h3>
  <ul>
    {#each statuses as status}
      <li>{status}</li>
    {/each}
  </ul>
  <button on:click|preventDefault={hideSelf}>I'm done here</button>
</div>
