<script lang="ts">
  import CopyIcon from '$lib/assets/CopyIcon.svelte';

  let origFill = '#000';

  let fill = $state(origFill);
  let isClicked = $state(false);

  let { copyValue = '', classes = '' } = $props();

  function handleMouseEnter() {
    fill = '#790E70';
  }

  function handleMouseLeave() {
    if (!isClicked) fill = origFill;
  }

  function handleClick() {
    copyText();
    fill = '#790E70';
    isClicked = true;
    setTimeout(() => {
      fill = origFill;
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

<div class="{classes} relative flex flex-col">
  <CopyIcon class="relative" {fill} {handleClick} {handleMouseEnter} {handleMouseLeave} />
  <span class="top-f24 xsText absolute whitespace-nowrap {!isClicked && 'hidden'}">Copied</span>
</div>
