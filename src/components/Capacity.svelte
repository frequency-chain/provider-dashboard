<script lang="ts">
  import { dotApi, storeChainInfo } from '$lib/stores';
  import { user } from '$lib/stores/userStore';
  import { activityLog } from '$lib/stores/activityLogStore';
  import { defaultCapacityDetails, getCapacityInfo, type CapacityDetails } from '$lib/polkadotApi';
  import { balanceToHuman } from '$lib/utils.js';
  import ListCard from './ListCard.svelte';
  import Stake from './Stake.svelte';
  import { Button } from '@frequency-chain/style-guide';

  let capacityDetails: CapacityDetails = $state(defaultCapacityDetails);

  $effect(() => {
    // Easy way to tag a subscription onto this action.
    // This way we update the capacity information when the log updates
    const _triggerReloadOnLogUpdate = $activityLog;
    if ($user?.msaId && $user.msaId !== 0 && $dotApi.api) {
      getCapacityInfo($dotApi.api, $user.msaId).then((info) => (capacityDetails = info));
    }
  });

  let showStakeToProvider = $state(false);
  let capacityList: { label: string; value: string }[] = $state([]);
  let errMsg: string = $state('');

  $effect(() => {
    if (!$user.injectedAccount && !$user.keyringPair) {
      errMsg = 'No transaction signing address selected';
    } else if (!$user.msaId) {
      errMsg = 'No MSA ID.  Please create one.';
    } else {
      errMsg = '';
      capacityList = [
        { label: 'Remaining', value: balanceToHuman(capacityDetails.remainingCapacity, 'CAP') },
        { label: 'Total Issued', value: balanceToHuman(capacityDetails.totalCapacityIssued, 'CAP') },
        { label: 'Last Replenished', value: `Epoch ${capacityDetails.lastReplenishedEpoch}` },
        { label: 'Staked Token', value: balanceToHuman(capacityDetails.totalTokensStaked, $storeChainInfo.token) },
      ];
    }
  });
</script>

<ListCard title="Capacity" list={capacityList} errorMessage={errMsg}>
  <Button size="sm" type="primary" class="btn-primary" onClick={() => (showStakeToProvider = true)}
    >Stake to Provider</Button
  >
  <Stake isOpen={showStakeToProvider} close={() => (showStakeToProvider = false)} />
</ListCard>
