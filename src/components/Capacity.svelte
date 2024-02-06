<script lang="ts">
  import { dotApi, storeChainInfo, storeCurrentAction } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import type { ApiPromise } from '@polkadot/api';
  import { getMsaEpochAndCapacityInfo } from '$lib/polkadotApi';
  import { balanceToHuman } from '$lib/utils.js';
  import ListCard from './ListCard.svelte';
  import { ActionForms } from '$lib/storeTypes.js';
  import { onMount } from 'svelte';

  type CapacityDetails = {
    remainingCapacity: bigint;
    totalTokensStaked: bigint;
    totalCapacityIssued: bigint;
    lastReplenishedEpoch: bigint;
  };
  const defaultDetails: CapacityDetails = {
    remainingCapacity: 0n,
    totalCapacityIssued: 0n,
    totalTokensStaked: 0n,
    lastReplenishedEpoch: 0n,
  };

  let capacityDetails: CapacityDetails = defaultDetails;

  onMount(async () => {
    let { capacityDetails } = await getMsaEpochAndCapacityInfo($dotApi.api as ApiPromise, $user.address);
    capacityDetails = { ...defaultDetails, ...capacityDetails };
  });

  function showStake() {
    storeCurrentAction.update((val) => (val = ActionForms.Stake));
  }

  let capacityList: { label: string; value: string }[] = [];
  let errMsg: string = '';

  $: {
    if (!$user.signingKey) {
      errMsg = 'No transaction signing address selected';
    } else if (!$user.msaId) {
      errMsg = 'No MSA ID.  Please create one.';
    } else {
      errMsg = '';
      capacityList = [
        { label: 'Remaining', value: balanceToHuman(capacityDetails?.remainingCapacity, 'CAP') },
        { label: 'Total Issued', value: balanceToHuman(capacityDetails?.totalCapacityIssued, 'CAP') },
        { label: 'Last Replenished', value: `Epoch ${capacityDetails?.lastReplenishedEpoch}` },
        { label: 'Staked Token', value: balanceToHuman(capacityDetails?.totalCapacityIssued, $storeChainInfo.token) },
      ];
    }
  }
</script>

<ListCard title="Capacity" list={capacityList} errorMessage={errMsg}>
  <button on:click={showStake} class="btn-primary">Stake To Provider</button>
</ListCard>
