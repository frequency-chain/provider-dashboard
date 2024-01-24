import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { GENESIS_HASHES, getBlockNumber, getEpoch } from './connections';
import { dotApi, storeBlockNumber, storeConnected, storeToken } from './stores';
import { storeProviderAccounts, storeValidAccounts } from './stores/accountsStore';
import { isLocalhost } from './utils';
import { options } from '@frequency-chain/api-augment';

import type { DotApi, MsaInfo } from '$lib/storeTypes';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { ChainProperties } from '@polkadot/types/interfaces';
import type { Option, u64 } from '@polkadot/types';

export type AccountMap = Record<string, KeyringPair>;
export type MetaMap = Record<string, InjectedAccountWithMeta>;

export async function getApi(selectedProviderURI: string, thisDotApi: DotApi, wsProvider: WsProvider) {
  if (!selectedProviderURI) {
    throw new Error('Empty providerURI');
  }
  // Handle disconnects
  if (selectedProviderURI) {
    if (thisDotApi?.api) {
      await thisDotApi.api.disconnect();
    } else if (wsProvider) {
      await wsProvider.disconnect();
    }
  }

  // Singleton Provider because it starts trying to connect here.
  wsProvider = new WsProvider(selectedProviderURI);
  const apiPromise = await ApiPromise.create({
    provider: wsProvider,
    throwOnConnect: true,
    throwOnUnknown: true,
    ...options,
  });

  await apiPromise.isReady;
  const initializedDotApi: DotApi = {
    wsProvider: wsProvider,
    api: apiPromise,
    keyring: new Keyring(),
    selectedEndpoint: selectedProviderURI,
    options,
  };
  dotApi.update((currentApi) => (currentApi = initializedDotApi));
}

export async function loadAccounts(
  selectedProviderURI: string,
  selectedProvider: string,
  thisWeb3Enable: typeof web3Enable,
  thisWeb3Accounts: typeof web3Accounts,
  apiPromise: ApiPromise
) {
  // populating for localhost and for a parachain are different since with localhost, there is
  // access to the Alice/Bob/Charlie accounts etc., and so won't use the extension.
  let foundAccounts: AccountMap | MetaMap = {}; // eslint-disable-line prefer-const
  if (isLocalhost(selectedProviderURI)) {
    const keyring = new Keyring({ type: 'sr25519' });

    ['//Alice', '//Bob', '//Charlie', '//Dave', '//Eve', '//Ferdie'].forEach((accountName) => {
      const account = { ...keyring.addFromUri(accountName), ...{ meta: { name: accountName } } };
      foundAccounts[account.address] = account;
    });
  } else {
    // Check that the polkadot extension is installed
    const extensions = await thisWeb3Enable('Frequency parachain provider dashboard');
    if (!extensions || !extensions.length) {
      alert('Polkadot{.js} extension not found; please install it first.');
      throw new Error('Polkadot{.js} extension not found; please install it first.');
    }

    const allAccounts = await thisWeb3Accounts();
    allAccounts.forEach((a) => {
      // display only the accounts allowed for this chain
      if (!a.meta.genesisHash || GENESIS_HASHES[selectedProvider] === a.meta.genesisHash) {
        foundAccounts[a.address] = a;
      }
    });
  }
  // to avoid updating subscribers with an empty list
  if (Object.keys(foundAccounts).length > 0) {
    storeValidAccounts.update((val) => (val = foundAccounts));

    let foundProviderAccounts: AccountMap | MetaMap = {};
    for (let index in Object.keys(foundAccounts)) {
      const account = Object.values(foundAccounts)[index];
      const { isProvider } = await getMsaInfo(apiPromise, account.address);
      if (isProvider) foundProviderAccounts[account.address] = account;
    }
    storeProviderAccounts.update((val) => (val = foundProviderAccounts));
  }
}

export function getToken(chain: ChainProperties) {
  const rawUnit = chain.tokenSymbol.toString();
  return rawUnit.slice(1, rawUnit.length - 1);
}

export async function updateConnectionStatus(apiPromise: ApiPromise) {
  const chain = await apiPromise.rpc.system.properties();
  const token = getToken(chain);
  const blockNumber = (await getBlockNumber(apiPromise)) as bigint;
  storeConnected.update((val) => (val = apiPromise.isConnected));
  storeToken.update((val) => (val = token));
  storeBlockNumber.update((val) => (val = blockNumber));
}

export type AccountBalances = {
  free: bigint;
  frozen: bigint;
  reserved: bigint;
};
export async function getBalances(apiPromise: ApiPromise, accountId: string): Promise<AccountBalances> {
  const accountData = (await apiPromise.query.system.account(accountId)).data;
  return {
    free: accountData.free.toBigInt(),
    frozen: accountData.frozen.toBigInt(),
    reserved: accountData.reserved.toBigInt(),
  };
}

export async function getMsaInfo(apiPromise: ApiPromise, accountId: string): Promise<MsaInfo> {
  const received: u64 = (await apiPromise.query.msa.publicKeyToMsaId(accountId)).unwrapOrDefault();
  const msaInfo: MsaInfo = { isProvider: false, msaId: 0, providerName: '' };
  msaInfo.msaId = received.toNumber();
  if (msaInfo.msaId > 0) {
    const providerRegistry: Option<any> = await apiPromise.query.msa.providerToRegistryEntry(msaInfo.msaId);
    if (providerRegistry.isSome) {
      msaInfo.isProvider = true;
      const registryEntry = providerRegistry.unwrap();
      msaInfo.providerName = registryEntry.providerName;
    }
  }
  return msaInfo;
}

export async function getMsaEpochAndCapacityInfo(
  apiPromise: ApiPromise,
  accountId: string
): Promise<{ epochNumber: bigint; msaInfo: MsaInfo; capacityDetails: any }> {
  const msaInfo = await getMsaInfo(apiPromise, accountId);
  const epochNumber = await getEpoch(apiPromise);
  let capacityDetails;
  if (msaInfo.msaId > 0) {
    const providerRegistry: Option<any> = await apiPromise.query.msa.providerToRegistryEntry(msaInfo.msaId);
    if (providerRegistry.isSome) {
      const details: any = (await apiPromise.query.capacity.capacityLedger(msaInfo.msaId)).unwrapOrDefault();
      capacityDetails = {
        remainingCapacity: details.remainingCapacity.toBigInt(),
        totalTokensStaked: details.totalTokensStaked.toBigInt(),
        totalCapacityIssued: details.totalCapacityIssued.toBigInt(),
        lastReplenishedEpoch: details.lastReplenishedEpoch.toBigInt(),
      };
    }
  }
  return { msaInfo, epochNumber, capacityDetails };
}
