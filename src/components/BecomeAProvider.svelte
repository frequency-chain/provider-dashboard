<script lang="ts">
  import { dotApi } from '$lib/stores';
  import { onMount } from 'svelte';
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import { defaultDotApi } from '$lib/storeTypes';
  import type { DotApi } from '$lib/storeTypes';
  import { user } from '$lib/stores/userStore';
  import { nonProviderAccountsStore } from '$lib/stores/accountsStore';
  import BlockSection from './BlockSection.svelte';
  import SelectNetworkAndAccount from './SelectNetworkAndAccount.svelte';
  import CreateMsa from './CreateMsa.svelte';
  import CreateProvider from './CreateProvider.svelte';
  import EmailProviderRequest from './EmailProviderRequest.svelte';
  import { pageContent } from '$lib/stores/pageContentStore';

  let localDotApi: DotApi = defaultDotApi;
  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;

  // a callback for when the user cancels this action
  export let cancelAction = () => {
    pageContent.login();
  };

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

  dotApi.subscribe((api) => (localDotApi = api));
</script>

<div id="become-a-provider" class="content-block column w-single-block">
  <BlockSection title="Become a provider">
    <form class="column w-[320px]">
      <SelectNetworkAndAccount
        selectedNetwork={$user.network}
        accountsStore={$nonProviderAccountsStore}
        accountSelectorTitle="Wallet Address"
        accountSelectorPlaceholder="Select a wallet address"
        noAccountsFoundErrorMsg="No accounts found.  Add an account to your wallet."
      ></SelectNetworkAndAccount>
      {#if $user.network != null && $user.network.name === 'MAINNET'}
        <EmailProviderRequest />
      {:else if $user.address !== ''}
        {#if $user.msaId === 0}
          <CreateMsa />
        {:else}
          <CreateProvider />
        {/if}
      {:else}
        <button on:click|preventDefault={cancelAction} class="btn-no-fill text-left">Cancel</button>
      {/if}
    </form>
  </BlockSection>
  <BlockSection title="More Info">
    <div
      style="width: 100%; color: white; font-size: 12px; font-family: Poppins; font-weight: 400; line-height: 18px; word-wrap: break-word"
    >
      For developer and testing convenience, on Testnet, anyone with an MSA who wishes to become a Provider may simply
      submit a createProvider transaction.<br /><br />This action will register the MSA Id that is controlled by the
      selected Transaction Signing Address above. Any control key for the MSA Id can submit the transaction.
    </div>
  </BlockSection>
</div>
