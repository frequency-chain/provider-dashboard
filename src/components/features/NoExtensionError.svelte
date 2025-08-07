<script lang="ts">
  import { hasExtension } from '$lib/stores/accountsStore';
  import { Button, Modal, Assets } from '@frequency-chain/style-guide';
</script>

<Modal open={$hasExtension === false} title="Extension Not Found" description={`Polkadot{.js} extension not found. Please install it first.`}>
  {#snippet body()}
    <div class="flex flex-col gap-f16 items-center">
      <Assets.Error class="w-f32 h-f32" />
      <div>In order to continue using Frequency's Provider Dashboard, you must connect a Polkadot.js wallet extension and have an existing wallet.</div>
      <Button href="https://polkadot.com/get-started/wallets/" target="__blank" size="md">How to setup your wallet <Assets.Arrow class="rotate-135 w-f16" /></Button>
    </div>
  {/snippet}
</Modal>