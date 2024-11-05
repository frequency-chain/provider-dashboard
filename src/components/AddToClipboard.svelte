<script lang="ts">
  import CopyIcon from '../lib/assets/CopyIcon.svelte';

  let fillColor = $state('#000');
  let isClicked = $state(false);

  let { copyValue = '' } = $props();

  function handleMouseEnter() {
    fillColor = '#5E69FF';
  }

  function handleMouseLeave() {
    if (!isClicked) fillColor = '#000';
  }

  function handleClick() {
    fillColor = '#7CFA4D';
    isClicked = true;
    setTimeout(() => {
      fillColor = '#000';
      isClicked = false;
    }, 2000);
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(copyValue);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }
</script>

<button onclick={copyText} class="ml-2 flex h-[30px] items-center justify-center">
  <CopyIcon {fillColor} {handleClick} {handleMouseEnter} {handleMouseLeave} />
</button>
