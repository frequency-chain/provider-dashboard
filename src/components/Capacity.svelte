<script lang="ts">
  import { dotApi, storeChainInfo } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import { getCapacityInfo, type CapacityDetails } from '$lib/polkadotApi';
  import { balanceToHuman } from '$lib/utils.js';
  import ListCard from './ListCard.svelte';
  import Stake from './Stake.svelte';

  let capacityDetails: CapacityDetails;

  $: {
    // Easy way to tag a subscription onto this action.
    // This way we update the capacity information when the log updates
    const _triggerReloadOnLogUpdate = $activityLog;
    if ($user?.msaId && $user.msaId !== 0 && $dotApi.api) {
      getCapacityInfo($dotApi.api, $user.msaId).then((info) => (capacityDetails = info));
    }
  }

  let showStakeToProvider = false;
  let capacityList: { label: string; value: string }[] = [];
  let errMsg: string = '';

  $: {
    if (!$user.injectedAccount && !$user.keyringPair) {
      errMsg = 'No transaction signing address selected';
    } else if (!$user.msaId) {
      errMsg = 'No MSA ID.  Please create one.';
    } else {
      errMsg = '';
      capacityList = [
        { label: 'Remaining', value: balanceToHuman(capacityDetails?.remainingCapacity, 'CAP') },
        { label: 'Total Issued', value: balanceToHuman(capacityDetails?.totalCapacityIssued, 'CAP') },
        { label: 'Last Replenished', value: `Epoch ${capacityDetails?.lastReplenishedEpoch}` },
        { label: 'Staked Token', value: balanceToHuman(capacityDetails?.totalTokensStaked, $storeChainInfo.token) },
      ];
    }
  }
</script>

<ListCard title="Capacity" list={capacityList} errorMessage={errMsg}>
  <button on:click|preventDefault={() => (showStakeToProvider = true)} class="btn-primary">Stake to Provider</button>
  <Stake isOpen={showStakeToProvider} close={() => (showStakeToProvider = false)} />
</ListCard>
