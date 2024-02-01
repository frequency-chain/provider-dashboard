<script lang="ts">
  import FAQItem from '$components/FAQItem.svelte';
</script>

<div class="content-block w-single-block text-left text-base">
  <h2 class="section-title">FAQ's</h2>

  <FAQItem>
    <span slot="question">What is the difference between Mainnet and Testnet (Rococo)?</span>
    <div slot="answer" class="column">
      <p>
        The Frequency Mainnet is the production Frequency blockchain network. The Frequency Rococo Testnet, which works
        with the Polkadot Rococo Testnet, is for developers to test and debug applications without risking real assets.
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
  </FAQItem>

  <FAQItem>
    <span slot="question">How do I transact on Frequency as a provider?</span>
    <div slot="answer" class="column">
      <p>
        To transact on Frequency as a provider you will need frequency utility tokens. On Frequency testnet, you can get
        tokens from the Testnet Faucet.
      </p>
      <p>To do that:</p>
      <ul class="unordered-list">
        <li>
          <a href="https://faucet.rococo.frequency.xyz/" target="_blank" rel="noopener noreferrer" class="underline">
            Get XRQCY tokens for Frequency Testnet (Rococo)
          </a>
          and follow the instructions using your desired wallet address to get XRQCY tokens.
        </li>
        <li>
          Once that succeeds, verify the tokens have made it to your wallet by selecting or re-selecting the address
          above. You may need to wait a minute.
        </li>
        <li>
          For more information, you can also visit the
          <a
            href="https://cloudflare-ipfs.com/ipns/dotapps.io/#/accounts"
            target="_blank"
            rel="noopener noreferrer"
            class="underline"
          >
            Rococo Accounts page via the Polkadot UI.
          </a>
          .
        </li>
      </ul>
    </div>
  </FAQItem>
</div>
