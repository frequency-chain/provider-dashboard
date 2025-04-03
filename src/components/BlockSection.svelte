<script lang="ts">
  interface Props {
    title: string;
    id?: string;
    children?: import('svelte').Snippet;
  }

  let { title, id, children }: Props = $props();
</script>

<div class="content-block column" {id}>
  <h2 class="section-title-underlined">{title}</h2>
  {@render children?.()}
</div>
