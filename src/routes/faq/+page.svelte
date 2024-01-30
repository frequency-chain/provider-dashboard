<script lang="ts">
  let openItem: null | number = null;
  const questions: { q: string; a: string }[] = [
    {
      q: 'What is the difference between Mainnet and Testnet (Rococo)?',
      a: 'The Frequency Mainnet is the production Frequency blockchain network. The Frequency Rococo Testnet, which works with the Polkadot Rococo Testnet, is for developers to test and debug applications without risking real assets. <br /><br />What about the other options?<ul class="ml-6 list-disc"><li>To connect to a node running on your desktop, choose Localhost.</li><li>To connect to a node that is not in the list, choose Other, then type the desired WebSocket address in the text field.</li><ul>',
    },
    {
      q: 'How do I transact on Frequency as a provider?',
      a: 'To transact on Frequency as a provider you will need frequency utility tokens. On Frequency testnet, you can get tokens from the Testnet Faucet. <br /><br />To do that: <ul class="ml-6 list-disc"><li><a href="https://faucet.rococo.frequency.xyz/" target="_blank" rel="noopener noreferrer" class="underline">Get XRQCY tokens for Frequency Testnet (Rococo)</a> and follow the instructions using your desired wallet address to get XRQCY tokens.</li><li>Once that succeeds, verify the tokens have made it to your wallet by selecting or re-selecting the address above. You may need to wait a minute.</li><li>For more information, you can also visit the <a href="https://cloudflare-ipfs.com/ipns/dotapps.io/#/accounts" target="_blank" rel="noopener noreferrer" class="underline">Rococo Accounts page via the Polkadot UI.</a>.</li><ul>',
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
      {@html item.a}
    </div>
  {/each}
</div>
