<script lang="ts">
  interface Props {
    title?: string;
    list?: { label: string; value: string }[];
    errorMessage: string;
    children?: import('svelte').Snippet;
  }

  let { title = '', list = [], errorMessage, children }: Props = $props();
</script>

<div class="content-block relative min-w-fit flex-grow">
  <p class="section-title-underlined">{title}</p>
  {#if errorMessage != ''}
    <div class="pt-3">{errorMessage}</div>
  {:else}
    <div class="mb-16">
      {#each list as item}
        <div class="border-divider flex items-center justify-between border-b py-3">
          <div class="label">{item.label}</div>
          <div class="data-value-base">{item.value}</div>
        </div>
      {/each}
      <div class="absolute bottom-7 right-7">
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>
