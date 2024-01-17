<script lang="ts">
  let title: string;
</script>

<div class="content-block w-single-block flex flex-col gap-4">
  <h2 class="section-title-underlined">{title}</h2>
  <slot />
</div>
