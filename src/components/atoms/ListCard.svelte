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
    <div>
      {#each list as item}
        <div class="border-divider flex items-center justify-between border-b py-3">
          <div class="label">{item.label}</div>
          <div class="font-bold">{item.value}</div>
        </div>
      {/each}
      <div class="pt-f32 gap-f8 flex flex-wrap justify-self-end">
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>
