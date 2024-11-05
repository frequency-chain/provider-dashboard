<script lang="ts">
  import FAQItem from '$components/FAQItem.svelte';
  import HowToTransact from '$components/HowToTransact.svelte';
</script>

<div class="content-block w-single-block text-left text-base">
  <h2 class="section-title">FAQ's</h2>

  <FAQItem>
    {#snippet question()}
      <span>What is the difference between Mainnet and Testnets?</span>
    {/snippet}
    {#snippet answer()}
      <div class="column">
        <p>
          The Frequency Mainnet is the production Frequency blockchain network. The Frequency Testnet, which works with
          the Polkadot Paseo Testnet relay chain, are for developers to test and debug applications without risking real
          assets.
        </p>
        <p>What about the other options?</p>
        <ul class="unordered-list">
          <li>To connect to a node running on your desktop, choose Localhost.</li>
          <li>
            To connect to a node that is not in the list, choose Other, then type the desired WebSocket address in the
            text field.
          </li>
        </ul>
      </div>
    {/snippet}
  </FAQItem>

  <FAQItem>
    {#snippet question()}
      <span>How do I transact on Frequency as a provider?</span>
    {/snippet}
    {#snippet answer()}
      <HowToTransact />
    {/snippet}
  </FAQItem>
</div>
