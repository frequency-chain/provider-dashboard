<script lang="ts">
  interface Props {
    title?: string;
    action?: () => void;
    [key: string]: unknown;
  }

  let { title = '', action = () => {}, ...rest }: Props = $props();

  function handleOnClick(e: Event) {
    e.preventDefault();
    action();
  }
</script>

<button onclick={handleOnClick} class="btn-primary" {...rest}>{title}</button>
