<script lang="ts">
  import { storeChainInfo } from '$lib/stores';

  let chainStatus = $derived([
    { label: 'Current Block', value: $storeChainInfo.blockNumber, id: 'block-number' },
    { label: 'Epoch', value: $storeChainInfo.epochNumber, id: 'epoch-number' },
    { label: 'Token', value: $storeChainInfo.token, id: 'token' },
  ]);
</script>

<div id="chain-status" class="content-block border-gray3">
  <h3 class="section-title-underlined">Overview</h3>
  <div class="flex flex-col md:flex-row md:justify-between">
    {#each chainStatus as status, index}
      <div
        class={`flex flex-col gap-1 p-2 md:min-w-[30%] md:gap-6 md:p-5 ${index > 0 && 'md:border-divider md:border-l'}`}
      >
        <p class="label" id={`${status.id}-title`}>{status.label}:</p>
        <p class="data-value-md lg:data-value-2xl" id={`${status.id}-value`}>{status.value}</p>
      </div>
    {/each}
  </div>
</div>
