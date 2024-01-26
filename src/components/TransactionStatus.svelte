<script lang="ts">
  export let isLoading = false;
  export let isOpen = false;
  export let statuses: Array<string> = [];

  const hideSelf = (evt: Event) => {
    evt.preventDefault();
    isOpen = false;
  };
</script>

<div class:hidden={!isOpen} id="transaction-status" class="">
  <p class="action-card-title">Transaction status</p>
  <ul class="">
    {#each statuses as status}
      <li class="text-sm font-light">{status}</li>
    {/each}
  </ul>
  {#if isLoading}
    ...loading
  {/if}
  <button on:click|preventDefault={hideSelf} class="btn-primary">Dismiss Status</button>
</div>
