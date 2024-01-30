<script lang="ts">
  import { user } from '$lib/stores/userStore';
  export let title = '';
  export let list: { label: string; value: string }[] = [];
  export let connected = false;
</script>

<div class="content-block relative min-w-fit flex-grow">
  <p class="section-title-underlined">{title}</p>
  {#if !connected}
    <div class="pt-3">Not connected</div>
  {:else if !$user.address}
    <div class="pt-3">No transaction signing address selected</div>
  {:else if $user.msaId === 0}
    <div class="pt-3">No Msa Id. Please create an MSA first.</div>
  {:else}
    <div class="mb-16">
      {#each list as item}
        <div class="flex items-center justify-between border-b border-divider py-3">
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
