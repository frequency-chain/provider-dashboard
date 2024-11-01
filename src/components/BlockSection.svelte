<script lang="ts">
  interface Props {
    title: string;
    children?: import('svelte').Snippet;
  }

  let { title, children }: Props = $props();
</script>

<div class="content-block column">
  <h2 class="section-title-underlined">{title}</h2>
  {@render children?.()}
</div>
