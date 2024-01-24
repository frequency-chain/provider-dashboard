<script lang="ts">
  import { onMount } from 'svelte';
  import { defaultDotApi } from '$lib/storeTypes';
  import { dotApi, isLoggedIn, transactionSigningAddress } from '$lib/stores';
  import { createMailto } from '$lib/utils';
  import type { ApiPromise, WsProvider } from '@polkadot/api';
  // import TransactionStatus from '$components/TransactionStatus.svelte';
  import type { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import DropDownMenu from '$components/DropDownMenu.svelte';
  import BlockSection from '$components/BlockSection.svelte';
  import Button from '$components/Button.svelte';
  import { pageContent } from '$lib/stores/pageContentStore';
  import { Network, allNetworks, networkToInfo, selectedNetwork } from '$lib/stores/networksStore';
  import { getApi, updateConnectionStatus } from '$lib/polkadotApi';
  import { fetchAccounts } from '$lib/stores/accountsStore';

  let wsProvider: WsProvider;

  let networks = allNetworks();

  let selectedNetworkAsString: string = '';
  let customNetwork: string = '';
  let selectedAccountAsString: string = '';
  let providerAccounts: Record<string, string> = {};

  let canConnect = false;
  $: canConnect = selectedNetworkAsString !== '' && selectedAccountAsString !== '';

  let newProviderName = '';
  let thisDotApi = defaultDotApi;
  dotApi.subscribe((api) => (thisDotApi = api));

  let thisWeb3FromSource: typeof web3FromSource;
  let thisWeb3Enable: typeof web3Enable;
  let thisWeb3Accounts: typeof web3Accounts;

  let showTransactionStatus = false;
  let mailTo = createMailto('hello@frequency.xyz', 'Request to be a Provider', '');
  export let txnStatuses: Array<string> = [];
  // export let validAccounts = {};
  export let signingAddress = '';
  // a callback for when the user cancels this action
  // export let cancelAction = () => {
  //   console.log('default cancelAction callback');
  // };
  // a callback for when a transaction hits a final state
  // export let txnFinished = () => {
  //   console.log('default txnFinished callback');
  // };

  onMount(async () => {
    const extension = await import('@polkadot/extension-dapp');
    thisWeb3FromSource = extension.web3FromSource;
    thisWeb3Enable = extension.web3Enable;
  });

  selectedNetwork.subscribe(async (network) => {
    console.log('selectedNetwork changed to ' + network);
    if (network != undefined && network != Network.NONE) {
      let info = networkToInfo[network];
      console.dir(info);
      let endpoint = networkToInfo[network].endpoint;
      console.log('endpoint: ' + endpoint);
      try {
        await getApi(endpoint?.toString() ?? '', thisDotApi, wsProvider);
        await fetchAccounts(network, thisWeb3Enable, thisWeb3Accounts, thisDotApi.api as ApiPromise);
        await updateConnectionStatus(thisDotApi.api as ApiPromise);
      } catch (e) {
        console.log(e);
        alert(
          `could not connect to ${
            endpoint?.toString() || 'empty value'
          }. Please enter a valid and reachable Websocket URL.`
        );
      }
    }
  });

  function networkChanged() {
    console.log('networkChanged');
    console.log('selectedNetworkAsString: ' + selectedNetworkAsString);
    $selectedNetwork = selectedNetworkAsString as Network;
  }

  function accountChanged() {
    console.log('accountChanged');
    console.log('selectedAccountAsString: ' + selectedAccountAsString);
    transactionSigningAddress.set(selectedAccountAsString);
  }

  function createProvider() {
    $isLoggedIn = true;
    pageContent.dashboard();
  }

  transactionSigningAddress.subscribe((addr) => (signingAddress = addr));

  // TODO: Leave this in for now, but we need to figure out how to handle this
  // const doProposeToBeProvider = async (_evt: Event) => {
  //   if (newProviderName === '') {
  //     alert('please enter a Provider Name');
  //     return;
  //   }
  //   if (!thisDotApi) {
  //     alert('please reconnect to an endpoint');
  //     return;
  //   }
  //   clearTxnStatuses();
  //   let endpointURI: string = thisDotApi.selectedEndpoint || '';
  //   let signingKeys = validAccounts[signingAddress];
  //   showTransactionStatus = true;
  //   if (isLocalhost(endpointURI)) {
  //     await submitRequestToBeProvider(
  //       thisDotApi.api as ApiPromise,
  //       undefined,
  //       endpointURI,
  //       signingKeys,
  //       newProviderName,
  //       addNewTxnStatus,
  //       txnFinished
  //     );
  //   } else {
  //     if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
  //       const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Proposing to be provider');
  //       if (extensions.length !== 0) {
  //         const injectedExtension = await thisWeb3FromSource(signingKeys.meta.source);
  //         await submitRequestToBeProvider(
  //           thisDotApi.api as ApiPromise,
  //           injectedExtension,
  //           endpointURI,
  //           signingKeys,
  //           newProviderName,
  //           addNewTxnStatus,
  //           txnFinished
  //         );
  //       } else {
  //         console.error('found no extensions');
  //         return;
  //       }
  //     } else {
  //       console.error('web3FromSource is function? ', isFunction(thisWeb3FromSource));
  //       console.error('web3Enable is function? ', isFunction(thisWeb3Enable));
  //     }
  //   }
  // };

  const addNewTxnStatus = (txnStatus: string) => {
    txnStatuses = [...txnStatuses, txnStatus];
    return;
  };
  const clearTxnStatuses = () => (txnStatuses = new Array<string>());
</script>

<div id="request-to-be-provider" class="content-block w-single-block flex flex-col gap-4">
  <BlockSection title="Become a provider">
    <DropDownMenu
      id="network"
      label="Select a Network"
      bind:action={selectedNetworkAsString}
      onChange={networkChanged}
      placeholder=""
      options={networks}
    />
    <input
      type="text"
      id="other-endpoint-url"
      placeholder="wss://some.frequency.node"
      bind:value={customNetwork}
      disabled={$selectedNetwork != Network.CUSTOM}
      class:hidden={$selectedNetwork != Network.CUSTOM}
    />
    <DropDownMenu
      id="controlkeys"
      label="Select a Provider Control Key"
      bind:action={selectedAccountAsString}
      onChange={accountChanged}
      placeholder=""
      options={providerAccounts}
    />
    <label for="providerNameRtB">Provider name</label>
    <input id="providerNameRtB" placeholder="Short name" maxlength="16" bind:value={newProviderName} />
    <div class="flex justify-between align-bottom">
    <Button id="create-provider-button" title="Create Provider" disabled={!canConnect} action={createProvider} />
    <button class="btn-no-fill" on:click={close}>Cancel</button>
    </div>
  </BlockSection>

  <BlockSection title="More Info">
    <div class="text-sm">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
      aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
  </BlockSection>
</div>
