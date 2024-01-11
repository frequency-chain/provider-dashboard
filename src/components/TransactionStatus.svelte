<script lang="ts">
  export let showSelf = false;
  export let statuses: Array<string> = [];

  const hideSelf = (evt: Event) => {
    evt.preventDefault();
    showSelf = false;
  };
</script>

<div
  class:hidden={!showSelf}
  id="transaction-status"
  class="ml-8 action-card basis-1/3 grow-1"
>
  <p class="action-card-title">Transaction status</p>
  <ul class="">
    {#each statuses as status}
      <li class="last:text-aqua mt-4 text-md font-light">{status}</li>
    {/each}
  </ul>
  <button on:click|preventDefault={hideSelf} class="btn-primary">Dismiss Status</button>
</div>
