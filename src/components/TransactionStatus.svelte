<script lang="ts">
  export let showSelf = false;
  export let statuses: Array<string> = [];

  const hideSelf = (evt: Event) => {
    evt.preventDefault();
    showSelf = false;
  };
</script>

<div class:hidden={!showSelf} id="transaction-status" class="action-card grow-1 ml-8 basis-1/3">
  <p class="action-card-title">Transaction status</p>
  <ul class="">
    {#each statuses as status}
      <li class="text-md mt-4 font-light">{status}</li>
    {/each}
  </ul>
  <button on:click|preventDefault={hideSelf} class="btn-primary">Dismiss Status</button>
</div>
