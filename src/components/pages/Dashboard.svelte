<script lang="ts">
  import { run } from 'svelte/legacy';

  import Capacity from '$features/Capacity/Capacity.svelte';
  import Provider from '$features/Provider/Provider.svelte';
  import ProfileOverview from '$features/ProfileOverview/ProfileOverview.svelte';
  import { fetchAccountsForNetwork } from '$lib/stores/accountsStore';
  import { user } from '$lib/stores/userStore';
  import type { ApiPromise } from '@polkadot/api';
  import { dotApi } from '$lib/stores';
  import { onMount } from 'svelte';
  import type { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
  import ChainStatus from '$features/ChainStatus/ChainStatus.svelte';

  let thisWeb3Accounts: typeof web3Accounts | undefined = $state();
  let thisWeb3Enable: typeof web3Enable | undefined = $state();

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3Accounts = extension.web3Accounts;
    thisWeb3Enable = extension.web3Enable;
  });

  run(() => {
    if ($user.network && thisWeb3Enable && thisWeb3Accounts) {
      fetchAccountsForNetwork($user.network, thisWeb3Enable, thisWeb3Accounts, $dotApi.api as ApiPromise).then(() =>
        console.info('Accounts store updated.')
      );
    }
  });
</script>

<div class="max-w-dashboard column w-full" id="dashboard">
  <ProfileOverview />

  <ChainStatus />

  <div class="mx-f8 flex flex-col justify-center gap-4 lg:flex-row">
    <Provider />
    <Capacity />
  </div>
</div>
