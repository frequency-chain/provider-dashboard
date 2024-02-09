<script lang="ts">
  import { dotApi, storeChainInfo } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { getCapacityInfo, type CapacityDetails } from '$lib/polkadotApi';
  import { balanceToHuman } from '$lib/utils.js';
  import ListCard from './ListCard.svelte';
  import Stake from './Stake.svelte';

  let capacityDetails: CapacityDetails;

  $: {
    if ($user?.msaId && $user.msaId !== 0 && $dotApi.api) {
      getCapacityInfo($dotApi.api, $user.msaId).then((info) => (capacityDetails = info));
    }
  }

  let showStakeToProvider = false;
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
  <button on:click|preventDefault={() => (showStakeToProvider = true)} class="btn-primary">Stake to Provider</button>
  <Stake providerId={$user.msaId} isOpen={showStakeToProvider} close={() => (showStakeToProvider = false)} />
</ListCard>
