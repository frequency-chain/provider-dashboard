<script lang="ts">
  import { dotApi, storeConnected, storeMsaInfo, storeToken, transactionSigningAddress } from '$lib/stores';
  import type { MsaInfo } from '$lib/storeTypes';
  import { balanceToHuman } from '$lib/utils';
  import type { ApiPromise } from '@polkadot/api';
  import { getBalances } from '$lib/polkadotApi';
  import type { AccountBalances } from '$lib/polkadotApi';

  let msaInfo: MsaInfo;
  let accountBalances: AccountBalances = { free: 0n, reserved: 0n, frozen: 0n };

  let connected = false;
  storeConnected.subscribe((val) => (connected = val));

  let token = '';
  storeToken.subscribe((val) => (token = val.toString()));

  let api: ApiPromise;
  dotApi.subscribe((storeDotApi) => {
    if (storeConnected && storeDotApi.api) {
      api = storeDotApi.api;
    }
  });

  let localSigningAddress = ''; // eslint-disable-line no-unused-vars
  transactionSigningAddress.subscribe(async (val) => {
    localSigningAddress = val;
    if (api) {
      accountBalances = await getBalances(api, val);
    }
  });

  storeMsaInfo.subscribe((info: MsaInfo) => {
    msaInfo = info;
  });
</script>

<div class="p-14 action-card flex-grow min-w-fit font-semibold tracking-wider bg-bg-black align-top">
  <table>
    <tr>
      <td colspan="2" class="text-2xl pb-6">Provider</td>
    </tr>
    {#if !connected}
      <tr>
        <td colspan="2">Not connected</td>
      </tr>
    {:else if localSigningAddress === ''}
      <tr>
        <td colspan="2">No transaction signing address selected</td>
      </tr>
    {:else}
      {#if msaInfo?.msaId === 0}
        <tr>
          <td colspan="2">No Msa Id. Please create an MSA first.</td>
        </tr>
      {:else}
        <tr>
          <td>Id:</td>
          <td class="pl-4 font-medium">{msaInfo.msaId}</td>
        </tr>
      {/if}
      {#if msaInfo?.isProvider}
        <tr>
          <td>Name:</td>
          <td class="pl-4 font-medium">{msaInfo.providerName}</td>
        </tr>
      {:else if msaInfo.msaId > 0}
        <tr>
          <td colspan="2">Selected Key is not associated with a Provider</td>
        </tr>
      {/if}
    {/if}
    {#if localSigningAddress !== ''}
      <tr>
        <td>Total Balance:</td>
        <td class="pl-4 font-light">{balanceToHuman(accountBalances.free + accountBalances.frozen, token)}</td>
      </tr>
      <tr>
        <td>Transferable:</td>
        <td class="pl-4 font-light"> {balanceToHuman(accountBalances.free, token)}</td>
      </tr>
      <tr>
        <td>Locked:</td>
        <td class="pl-4 font-light"> {balanceToHuman(accountBalances.frozen, token)}</td>
      </tr>
    {/if}
  </table>
</div>
