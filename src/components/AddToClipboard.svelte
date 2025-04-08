<script lang="ts">
  import CopyIcon from '../lib/assets/CopyIcon.svelte';

  let origFill = '#000';

  let fill = $state(origFill);
  let isClicked = $state(false);

  let { copyValue = '', classes = '' } = $props();

  function handleMouseEnter() {
    fill = '#55B1AB';
  }

  function handleMouseLeave() {
    if (!isClicked) fill = origFill;
  }

  function handleClick() {
    copyText();
    fill = '#55B1AB';
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

<div class="{classes} flex min-w-f48 flex-col">
  <CopyIcon {fill} {handleClick} {handleMouseEnter} {handleMouseLeave} />
  <span class="absolute top-f24 text-xs {!isClicked && 'hidden'}">Copied</span>
</div>
