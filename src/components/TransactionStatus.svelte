<script lang="ts">
  export let showSelf = false;
  export let statuses: Array<string> = [];

  const hideSelf = (evt: Event) => {
    evt.preventDefault();
    showSelf = false;
  };
</script>

<div class:hidden={!showSelf} id="transaction-status" class="column w-full">
  <span class="border-1 border-b border-divider" />

  <div>
    <p class="label">Transaction Status</p>
    <ul class="unordered-list break-words text-sm">
      {#each statuses as status}
        <li>{status}</li>
      {/each}
    </ul>
    <button on:click|preventDefault={hideSelf} class="btn-no-fill mt-4">Dismiss Status</button>
  </div>
</div>
