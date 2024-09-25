<script lang="ts">
  import Clipboard from './Clipboard.svelte';
  import CopyIcon from '../lib/assets/CopyIcon.svelte';

  let fillColor = '#fff';
  let isClicked = false;

  function handleMouseEnter() {
    fillColor = '#459ABA';
  }

  function handleMouseLeave() {
    if (!isClicked) fillColor = '#fff';
  }

  function handleClick() {
    fillColor = '#7CFA4D'; // Change to green on click
    isClicked = true;
    setTimeout(() => {
      fillColor = '#fff'; // Reset to original
      isClicked = false;
    }, 2000);
  }

  export let copyValue = '';

  const copy = () => {
    const app = new Clipboard({
      target: document.getElementById('clipboard')!,
      props: { copyValue },
    });
    app.$destroy();
  };
</script>

<button on:click={copy} class="ml-2 flex h-[30px] items-center justify-center">
  <CopyIcon {fillColor} {handleClick} {handleMouseEnter} {handleMouseLeave} />
  <slot />
</button>

<div id="clipboard"></div>
