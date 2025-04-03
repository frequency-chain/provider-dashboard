<script lang="ts">
  import Capacity from '$components/Capacity.svelte';
  import Provider from '$components/Provider.svelte';
  import DashboardHeader from '$components/DashboardHeader.svelte';
  import ChainStatus from '$components/ChainStatus.svelte';
  import { fetchAccountsForNetwork } from '$lib/stores/accountsStore';
  import { user } from '$lib/stores/userStore';
  import type { ApiPromise } from '@polkadot/api';
  import { dotApi } from '$lib/stores';
  import { onMount } from 'svelte';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

  let thisWeb3Accounts: typeof web3Accounts;
  let thisWeb3Enable: typeof web3Enable;

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3Accounts = extension.web3Accounts;
    thisWeb3Enable = extension.web3Enable;
  });

  $: {
    if ($user.network) {
      fetchAccountsForNetwork($user.network, thisWeb3Enable, thisWeb3Accounts, $dotApi.api as ApiPromise).then(() =>
        console.info('Accounts store updated.')
      );
    }
  }
</script>

<div class="max-w-dashboard column w-full" id="dashboard">
  <DashboardHeader />

  <ChainStatus />

  <div class="mx-f8 flex flex-col justify-center gap-4 md:flex-row">
    <Provider />
    <Capacity />
  </div>
</div>
