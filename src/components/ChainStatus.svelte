<script lang="ts">
  export let token = 'none';
  export let blockNumber = 0n;
  export let epochNumber = 0n;

  const chainStatus = [
    { label: 'Current Block', value: blockNumber },
    { label: 'Epoch', value: epochNumber },
    { label: 'Token', value: token },
  ];
</script>

<div id="chain-status" class="content-block">
  <h3 class="section-title-underlined">Overview</h3>
  <div class="flex justify-around">
    {#each chainStatus as status, index}
      <div class={`flex min-w-[30%] flex-col gap-6 p-5 ${index > 0 && 'border-l border-divider'}`}>
        <p class="label" id="connection-status-title">{status.label}:</p>
        <p class="data-value-2xl" id="connection-status-value">{status.value}</p>
      </div>
    {/each}
  </div>
</div>
