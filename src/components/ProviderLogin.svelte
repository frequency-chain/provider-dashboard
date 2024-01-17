<script lang="ts">
  import DropDownMenu from '$components/DropDownMenu.svelte';

  let options: Record<string, string> = {
    '1': 'Record 1',
    '2': 'Record 2',
    '3': 'Record 3',
  };
</script>

<div class="content-block w-single-block flex flex-col gap-4">
    <h2 class="section-title-underlined">Provider Login</h2>
  <DropDownMenu label="Select a Network" required={true} disabled={false} placeholder="" {options}></DropDownMenu>
  <DropDownMenu label="Select a Provider Control Key" required={true} disabled={false} placeholder="" {options}></DropDownMenu>
  <div class="flex w-350 justify-between">
    <button on:click|preventDefault={addControlKey} class="btn-primary">Connect</button>
  </div>

  <div class="text-sm">
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
  </div>

  <div class="text-xs mt-24">
    To transact on Frequency as a provider you will need frequency utility tokens. On Frequency testnet, you can get tokens from the Testnet Faucet. To do that: Get XRQCY tokens for Frequency Testnet (Rococo) and follow the instructions using your desired wallet address to get XRQCY tokens. Once that succeeds, verify the tokens have made it to your wallet by selecting or re-selecting the address above. You may need to wait a minute. For more information, you can also visit the Rococo Accounts page via the Polkadot UI.
  </div>
</div>
