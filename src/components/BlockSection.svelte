<script lang="ts">
  export let title: string;
</script>

<div class="content-block column">
  <h2 class="section-title-underlined">{title}</h2>
  <slot />
</div>
