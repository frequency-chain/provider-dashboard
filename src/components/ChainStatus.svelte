<script lang="ts">
  import { storeChainInfo } from '$lib/stores';

  let chainStatus = $derived([
    { label: 'Current Block', value: $storeChainInfo.blockNumber, id: 'block-number' },
    { label: 'Epoch', value: $storeChainInfo.epochNumber, id: 'epoch-number' },
    { label: 'Token', value: $storeChainInfo.token, id: 'token' },
  ]);
</script>

<div id="chain-status" class="content-block">
  <h3 class="section-title-underlined">Overview</h3>
  <div class="flex justify-around">
    {#each chainStatus as status, index}
      <div class={`flex min-w-[30%] flex-col gap-6 p-5 ${index > 0 && 'border-l border-divider'}`}>
        <p class="label" id={`${status.id}-title`}>{status.label}:</p>
        <p class="data-value-2xl" id={`${status.id}-value`}>{status.value}</p>
      </div>
    {/each}
  </div>
</div>
