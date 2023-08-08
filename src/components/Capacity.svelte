<script lang="ts">
  import { storeConnected, transactionSigningAddress, dotApi, storeMsaInfo, storeBlockNumber } from '$lib/stores';
  import { u64, Option } from '@polkadot/types';
  import { getEpoch, getBlockNumber } from '$lib/connections';
  import type { ApiPromise } from '@polkadot/api';
  import type { MsaInfo} from "$lib/storeTypes";
  import { getMsaEpochAndCapacityInfo} from "$lib/polkadotApi";

  let connected;
  storeConnected.subscribe( val => connected = val);

  let msaInfo: MsaInfo = {isProvider: false, msaId: 0, providerName: ''};
  storeMsaInfo.subscribe( (info: MsaInfo )=> msaInfo = info );

  storeConnected.subscribe((val) => (connected = val));
  let apiPromise: ApiPromise | undefined;
  dotApi.subscribe((api) => {
    if (api?.api) {
      apiPromise = api.api;
    }
  });

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

  let signingAddress = ''; // eslint-disable-line no-unused-vars
  let epochNumber = 0n;
  let blockNumber = 0n;
  storeBlockNumber.subscribe((val) => (blockNumber = val));

  transactionSigningAddress.subscribe(async (addr) => {
    // first set/reset all our local values.
    signingAddress = addr;
    msaInfo = { isProvider: false, msaId: 0, providerName: ''};
    if (connected && apiPromise) {
      blockNumber = await getBlockNumber(apiPromise);
      storeBlockNumber.update((val) => (val = blockNumber));
    }
    if (connected && apiPromise?.query && addr) {
      let info = await getMsaEpochAndCapacityInfo(apiPromise, addr);
      msaInfo = {...msaInfo, ...info.msaInfo };
      capacityDetails = {...defaultDetails, ...info.capacityDetails};
      epochNumber = info.epochNumber;
      storeMsaInfo.set(msaInfo);
    }
  });
  export let token;
</script>
<div class:hidden={ !msaInfo.isProvider }>
  <h3>Capacity at Block {blockNumber}, Epoch {epochNumber}</h3>
  <p>Provider name: {msaInfo.providerName}</p>
  <p><strong>Remaining:</strong> {capacityDetails?.remainingCapacity}</p>
  <p><strong>Total Issued:</strong> {capacityDetails?.totalCapacityIssued}</p>
  <p><strong>Last replenished:</strong> Epoch {capacityDetails?.lastReplenishedEpoch}</p>
  <p><strong>Staked Token:</strong> {capacityDetails?.totalCapacityIssued} {token}</p>
</div>
