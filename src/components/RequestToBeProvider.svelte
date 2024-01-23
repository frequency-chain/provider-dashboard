<script lang="ts">
  import { onMount } from 'svelte';
  import { defaultDotApi } from '$lib/storeTypes';
  import { dotApi, isLoggedIn, transactionSigningAddress } from '$lib/stores';
  import { createMailto } from '$lib/utils';
  import type { ApiPromise } from '@polkadot/api';
  // import TransactionStatus from '$components/TransactionStatus.svelte';
  import type { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
  import DropDownMenu from '$components/DropDownMenu.svelte';
  import BlockSection from '$components/BlockSection.svelte';
  import Button from '$components/Button.svelte';
  import { pageContent } from '$lib/stores/pageContentStore';
  import { Network, allNetworks, networkToInfo, selectedNetwork } from '$lib/stores/networksStore';
  import { getApi, updateConnectionStatus } from '$lib/polkadotApi';
  import { fetchAccounts } from '$lib/stores/accountsStore';

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
  let showTransactionStatus = false;
  let mailTo = createMailto('hello@frequency.xyz', 'Request to be a Provider', '');
  export let txnStatuses: Array<string> = [];
  export let validAccounts = {};
  export let signingAddress = '';
  // a callback for when the user cancels this action
  export let cancelAction = () => {
    console.log('default cancelAction callback');
  }
  // a callback for when a transaction hits a final state
  export let txnFinished = () => {
    console.log('default txnFinished callback');
  };

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
      ></DropDownMenu>
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
      ></DropDownMenu>
      <label for="providerNameRtB">Provider name</label>
      <input id="providerNameRtB" placeholder="Short name" maxlength="16" bind:value={newProviderName} />
      <Button id="create-provider-button" title="Create Provider" disabled={!canConnect} action={createProvider}></Button>
      <div></div>
    </BlockSection>
  
    <BlockSection title="More Info">
      <div class="text-sm">
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
        aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
      </div>
    </BlockSection>


<!-- 
  <h2>Request to Be a Provider</h2>
  <h3>What is a Provider?</h3>
  <p>A Provider is an MSA holder on Frequency with special permissions.</p>
  <ol>
    <li>They can pay for transactions with Capacity as well as Frequency token.</li>
    <li>They can be permitted to post certain transactions on another MSA's behalf, also known as delegation.</li>
    <li>An MSA can stake token to generate Capacity, and designate a Provider to receive that Capacity.</li>
  </ol>
  <p>Anyone with an MSA ID on Frequency's Mainnet who wants to become a Provider must follow this process:</p>
  <ol>
    <li>Submit an on-chain transaction to request be become a provider by filling in and submitting the form below.</li>
    <li>
      <a href={mailTo} class="underline"> Contact the Frequency Council </a>
      and inform them that you have requested to become a Provider, and provide them with your MSA Id.
    </li>
  </ol>
  <form>
    <label for="providerNameRtB">Provider name</label>
    <input id="providerNameRtB" placeholder="Short name" maxlength="16" bind:value={newProviderName} />
    <div class="flex w-350 justify-between">

      <button on:click|preventDefault={doProposeToBeProvider} id="request-2b-provider-btn"
              class="btn-primary">
        Submit Request To Be Provider</button
      >
      <button on:click|preventDefault={cancelAction} class="btn-cancel">Cancel</button>
    </div>
  </form>
<TransactionStatus bind:showSelf={showTransactionStatus} statuses={txnStatuses} />
  -->
</div>
