<script lang="ts">
  import FAQItem from '$components/atoms/FAQItem.svelte';
  import HowToTransact from '$components/features/HowToTransact/HowToTransact.svelte';
</script>

{#snippet question1()}
  <span>What is the difference between Mainnet and Testnets?</span>
{/snippet}

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

{#snippet question2()}
  <span>How do I transact on Frequency as a provider?</span>
{/snippet}
{#snippet answer2()}
  <HowToTransact />
{/snippet}

<div class="content-block">
  <h2 class="text-md font-bold md:text-xl">FAQ's</h2>

  <FAQItem question={question1} answer={answer1} />

  <FAQItem question={question2} answer={answer2} />
</div>
