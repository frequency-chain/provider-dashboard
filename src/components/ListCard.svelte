<script lang="ts">
  export let title = '';
  export let list: { label: string; value: string }[] = [];
  export let errorMessage: string;
</script>

<div class="content-block relative min-w-fit flex-grow">
  <p class="section-title-underlined">{title}</p>
  {#if errorMessage != ''}
    <div class="pt-3">{errorMessage}</div>
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
