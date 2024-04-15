<script lang="ts">
  export let additionalStyles: string = '';
</script>

<div class={`column ${additionalStyles}`}>
  <p>
    To transact on Frequency as a provider you will need Frequency utility tokens. On Frequency Testnet, you can get
    tokens from the Testnet Faucet.
  </p>
  <p>To do that:</p>
  <ol class="ordered-list">
    <li>
      Get XRQCY tokens for the <a
        href="https://faucet.testnet.frequency.xyz/"
        target="_blank"
        rel="noopener noreferrer"
        class="underline">Frequency Testnet (Paseo)</a
      >
      or
      <a href="https://faucet.testnet.frequency.xyz/" target="_blank" rel="noopener noreferrer" class="underline"
        >Frequency Testnet (Rococo)</a
      > and follow the instructions using your desired wallet address to get XRQCY tokens.
    </li>
    <li>
      Once that succeeds, verify the tokens have made it to your wallet by selecting or re-selecting the address above.
      You may need to wait a minute.
    </li>
    <li>
      For more information, you can also visit the
      <a
        href="https://cloudflare-ipfs.com/ipns/dotapps.io/#/accounts"
        target="_blank"
        rel="noopener noreferrer"
        class="underline"
      >
        Accounts page for the correct network via the Polkadot UI.
      </a>
      .
    </li>
  </ol>
</div>
