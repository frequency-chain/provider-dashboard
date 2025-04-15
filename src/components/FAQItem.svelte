<script lang="ts">
  interface Props {
    question?: import('svelte').Snippet;
    answer?: import('svelte').Snippet;
  }

  let { question, answer }: Props = $props();
  let isOpen = $state(false);

  function toggleIsOpen() {
    isOpen = !isOpen;
  }
</script>

<button
  id="faq-question"
  class="label border-divider text-md mt-2 flex w-full items-center justify-between border-t p-4 text-left font-bold"
  onclick={toggleIsOpen}
>
  {@render question?.()}
  <svg
    class="ml-12 h-8 w-8 shrink-0 transform bg-black p-1 transition-transform duration-300 {isOpen ? 'rotate-180' : ''}"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      class="text-white"
      fill-rule="evenodd"
      d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
      clip-rule="evenodd"
    />
  </svg>
</button>

<div id="faq-answer" class="lg:text-md text-sm {`p-3 ${isOpen ? 'block' : 'hidden'}`}">
  {@render answer?.()}
</div>
