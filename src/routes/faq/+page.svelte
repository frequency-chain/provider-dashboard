<script lang="ts">
  import MainnetVsTestnet from '$components/FaqAnswers/MainnetVsTestnet.svelte';
  import TransactAsProvider from '$components/FaqAnswers/TransactAsProvider.svelte';
  import type { ComponentType } from 'svelte';

  let openItem: null | number = null;

  const questions: { q: string; a: ComponentType }[] = [
    {
      q: 'What is the difference between Mainnet and Testnet (Rococo)?',
      a: MainnetVsTestnet,
    },
    {
      q: 'How do I transact on Frequency as a provider?',
      a: TransactAsProvider,
    },
  ];
</script>

<div class="content-block w-single-block text-left text-base">
  <h2 class="section-title">FAQ's</h2>
  {#each questions as item, index}
    <button
      id="faq-question"
      class="label text-md mt-2 flex w-full items-center justify-between border-t border-divider p-4 text-left"
      on:click={() => (openItem = openItem === index ? null : index)}
    >
      {item.q}
      <svg
        class="w-8 ml-12 h-8 shrink-0 transform rounded bg-blue p-1 transition-transform duration-300 {openItem ===
        index
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
    <div id="faq-answer" class={`p-3 ${openItem === index ? 'block' : 'hidden'}`}>
      <svelte:component this={item.a} />
    </div>
  {/each}
</div>
