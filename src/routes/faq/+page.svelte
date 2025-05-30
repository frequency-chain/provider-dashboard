<script lang="ts">
  import { Accordion, AccordionList } from '@frequency-chain/style-guide';
  import HowToTransact from '$features/HowToTransact/HowToTransact.svelte';

  const question1 = 'What is the difference between Mainnet and Testnets?';
  const question2 = 'How do I transact on Frequency as a provider?';
</script>

{#snippet answer1()}
  <div class="column">
    <p>
      The Frequency Mainnet is the production Frequency blockchain network. The Frequency Testnet, which works with the
      Polkadot Paseo Testnet relay chain, are for developers to test and debug applications without risking real assets.
    </p>
    <p>What about the other options?</p>
    <ul class="unordered-list">
      <li>To connect to a node running on your desktop, choose Localhost.</li>
      <li>
        To connect to a node that is not in the list, choose Other, then type the desired WebSocket address in the text
        field.
      </li>
    </ul>
  </div>
{/snippet}

{#snippet answer2()}
  <HowToTransact />
{/snippet}

<div class="content-block">
  <h2 class="mdText font-bold md:text-xl">FAQ's</h2>

  <AccordionList>
    <Accordion trigger={question1} content={answer1} />
    <Accordion trigger={question2} content={answer2} />
  </AccordionList>
</div>
