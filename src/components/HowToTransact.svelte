<script lang="ts">
  export let additionalStyles: string = '';
</script>

<div class={`column ${additionalStyles}`}>
  <p>
    To transact on Frequency as a provider you will need frequency utility tokens. On Frequency testnet, you can get
    tokens from the Testnet Faucet.
  </p>
  <p>To do that:</p>
  <ol class="ordered-list">
    <li>
      <a href="https://faucet.rococo.frequency.xyz/" target="_blank" rel="noopener noreferrer" class="underline">
        Get XRQCY tokens for Frequency Testnet (Rococo)
      </a>
      and follow the instructions using your desired wallet address to get XRQCY tokens.
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
        Rococo Accounts page via the Polkadot UI.
      </a>
      .
    </li>
  </ol>
</div>
