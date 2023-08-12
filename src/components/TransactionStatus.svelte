<script lang="ts">
  export let showSelf = false;
  export let statuses: Array<string> = [];

  const hideSelf = (evt: Event) => {
    evt.preventDefault();
    showSelf = false;
  };
</script>

<div class:hidden={!showSelf} id="transaction-status" class="mt-8">
  <h3 class="font-semibold text-lg">Transaction status</h3>
  <ul class="list-disc ml-8">
    {#each statuses as status}
      <li class="last:text-scarlet">{status}</li>
    {/each}
  </ul>
  <button on:click|preventDefault={hideSelf} class="btn-secondary">I'm done here</button>
</div>
