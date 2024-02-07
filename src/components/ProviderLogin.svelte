<script lang="ts">
  import { isLoggedIn } from '$lib/stores';
  import BlockSection from '$components/BlockSection.svelte';
  import SelectNetworkAndAccount from './SelectNetworkAndAccount.svelte';
  import Button from '$components/Button.svelte';
  import HowToTransact from '$components/HowToTransact.svelte';
  import { pageContent } from '$lib/stores/pageContentStore';
  import { providerAccountsStore } from '$lib/stores/accountsStore';
  import { user } from '$lib/stores/userStore';
  import { createAndConnectToApi } from '$lib/polkadotApi';

  // Control whether or not the connect button is enabled or disabled
  let canConnect: boolean = false;
  $: canConnect = $user?.network != null && $providerAccountsStore.size > 0 && $user?.address !== '';

  async function connect() {
    if (!$user.network?.endpoint?.origin) {
      alert('Error connecting to endpoint.');
      return;
    }
    await createAndConnectToApi($user.network?.endpoint?.origin);
    $isLoggedIn = true;
    pageContent.dashboard();
  }

  function becomeProvider() {
    pageContent.becomeProvider();
  }
</script>

<div id="provider-login" class="content-block column w-single-block">
  <BlockSection title="Provider Login">
    <SelectNetworkAndAccount
      selectedNetwork={$user?.network}
      accountsStore={$providerAccountsStore}
      accountSelectorTitle="Select a Provider Control Key"
      accountSelectorPlaceholder="Select a provider control key"
      noAccountsFoundErrorMsg="No provider accounts found.  Become a provider?"
    ></SelectNetworkAndAccount>
    <Button id="connect-button" title="Connect" disabled={!canConnect} action={connect} />
  </BlockSection>

  <BlockSection title="Not a Provider?">
    <div class="text-sm">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
      aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
    <Button id="request-2b-provider-btn" title="Become a Provider" action={becomeProvider} />
  </BlockSection>

  <HowToTransact additionalStyles="mt-24 text-xs gap-1" />
</div>
