<script lang="ts">
  import type { MsaInfo } from '$lib/storeTypes';

  export let title = '';
  export let list: { label: string; value: string }[] = [];
  export let connected = false;
  export let signingAddress = '';
  export let msaInfo: MsaInfo;
</script>

<div class="content-block flex-grow min-w-fit relative">
  <p class="section-title border-b border-divider pb-3">{title}</p>
  {#if !connected}
    <div class="pt-3">Not connected</div>
  {:else if signingAddress === ''}
    <div class="pt-3">No transaction signing address selected</div>
  {:else if msaInfo?.msaId === 0}
    <div class="pt-3">No Msa Id. Please create an MSA first.</div>
  {:else}
    <div class="mb-16">
      {#each list as item}
        <div class="flex justify-between items-center py-3 border-b border-divider">
          <div class="label">{item.label}</div>
          <div class="data-value-base">{item.value}</div>
        </div>
      {/each}
      <div class="absolute bottom-7 right-7">
        <slot />
      </div>
    </div>
  {/if}
</div>
