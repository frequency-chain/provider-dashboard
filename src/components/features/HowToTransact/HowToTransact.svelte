<script lang="ts">
  import { Button } from '@frequency-chain/style-guide';

  interface Props {
    additionalStyles?: string;
  }

  let { additionalStyles = '' }: Props = $props();
</script>

<div class={`column gap-f16 ${additionalStyles}`}>
  <p>
    To transact on Frequency as a Provider you will need Frequency utility tokens. On Frequency Testnet, you can get
    tokens from the Testnet Faucet sent to the Account Id that you want to use.
  </p>

  <Button href="https://faucet.testnet.frequency.xyz" target="_blank">Testnet Faucet</Button>

  <ol class="ordered-list">
    <li>
      When you are done requesting funds from the faucet, verify the tokens have been applied by selecting or
      re-selecting the Account Id you chose above. You may need to wait a minute.
    </li>
    <li>
      For more information, visit the
      <a
        href="https://polkadot-dotapps-io.ipns.dweb.link/#/accounts"
        target="_blank"
        rel="noopener noreferrer"
        class="underline"
      >
        Polkadot Apps Accounts page
      </a>
      and select the desired Frequency network from the Polkadot UI.
    </li>
  </ol>
</div>
