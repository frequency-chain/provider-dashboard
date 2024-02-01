<script lang="ts">
  let isOpen = false;

  function toggleIsOpen() {
    isOpen = !isOpen;
  }
</script>

<button
  id="faq-question"
  class="label text-md mt-2 flex w-full items-center justify-between border-t border-divider p-4 text-left"
  on:click={toggleIsOpen}
>
  <slot name="question" />
  <svg
    class="w-8 ml-12 h-8 shrink-0 transform rounded bg-blue p-1 transition-transform duration-300 {isOpen
      ? 'rotate-180'
      : ''}"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fill-rule="evenodd"
      d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
      clip-rule="evenodd"
    />
  </svg>
</button>

<div id="faq-answer" class={`p-3 ${isOpen ? 'block' : 'hidden'}`}>
  <slot name="answer" />
</div>
