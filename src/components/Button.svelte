<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  interface Props {
    title?: string;
    action?: () => void;
    [key: string]: unknown;
  }

  let { title = '', action = () => {}, ...rest }: Props = $props();
</script>

<button onclick={preventDefault(action)} class="btn-primary" {...rest}>{title}</button>
