import type { DotApi, MsaInfo } from '$lib/storeTypes';
import { options } from '@frequency-chain/api-augment';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import type { Option, u64 } from '@polkadot/types';
import type { ChainProperties } from '@polkadot/types/interfaces';
import type { PalletCapacityCapacityDetails } from '@polkadot/types/lookup';
import { hexToString, u8aToHex } from '@polkadot/util';
import { decodeAvroPayload } from '$lib/utils';

type Schema = {
  schemaId: number;
  model: string | undefined;
};

type Intent = {
  intentId: number;
  payloadLocation: string;
  settings: string[];
  schemas: Schema[];
};

type IntentMap = Map<string, Intent>;

const intentCache: IntentMap = new Map<string, Intent>();

export async function createApi(networkEndpoint: string): Promise<DotApi> {
  const wsProvider = new WsProvider(networkEndpoint);

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
    selectedEndpoint: networkEndpoint,
    options,
  };
  return initializedDotApi;
}

export function getToken(chain: ChainProperties) {
  const rawUnit = chain.tokenSymbol.toString();
  return rawUnit.slice(1, rawUnit.length - 1);
}

export interface AccountBalances {
  transferable: bigint;
  locked: bigint;
  total: bigint;
}
export async function getBalances(apiPromise: ApiPromise, ControlKey: string): Promise<AccountBalances> {
  const accountData = ((await apiPromise.query.system.account(ControlKey)) as any).data;
  const free = accountData.free.toBigInt();
  const locked = accountData.frozen.toBigInt();
  const transferable = BigInt(free - locked);
  const total = free + accountData.reserved.toBigInt();
  return {
    transferable,
    locked,
    total,
  };
}

export async function getMsaInfoForPublicKey(apiPromise: ApiPromise, publicKey: string): Promise<MsaInfo> {
  const result = (await apiPromise?.query.msa.publicKeyToMsaId(publicKey)) as Option<u64>;
  const received = result?.unwrapOrDefault();

  return getMsaInfoById(apiPromise, received?.toNumber());
}

export async function getMsaInfoById(apiPromise: ApiPromise, msaId: number): Promise<MsaInfo> {
  const msaInfo: MsaInfo = { isProvider: false, msaId, providerName: '' };

  if (msaInfo.msaId > 0) {
    const providerRegistry = (await apiPromise.query.msa.providerToRegistryEntryV2(msaInfo.msaId)) as Option<any>;
    if (providerRegistry.isSome) {
      msaInfo.isProvider = true;
      const registryEntry = providerRegistry.unwrap();
      msaInfo.providerName = registryEntry.defaultName.toString();
    }
  }
  return msaInfo;
}

export interface CapacityDetails {
  remainingCapacity: bigint;
  totalTokensStaked: bigint;
  totalCapacityIssued: bigint;
  lastReplenishedEpoch: bigint;
}

export const defaultCapacityDetails: CapacityDetails = {
  remainingCapacity: 0n,
  totalCapacityIssued: 0n,
  totalTokensStaked: 0n,
  lastReplenishedEpoch: 0n,
};

export async function getCapacityInfo(apiPromise: ApiPromise, msaId: number): Promise<CapacityDetails> {
  const msaInfo = await getMsaInfoById(apiPromise, msaId);

  let capacityDetails = defaultCapacityDetails;

  if (msaInfo.isProvider) {
    const detailsResult = (await apiPromise.query.capacity.capacityLedger(
      msaId
    )) as Option<PalletCapacityCapacityDetails>;
    const details = detailsResult?.unwrapOrDefault();

    capacityDetails = {
      remainingCapacity: details.remainingCapacity.toBigInt(),
      totalTokensStaked: details.totalTokensStaked.toBigInt(),
      totalCapacityIssued: details.totalCapacityIssued.toBigInt(),
      lastReplenishedEpoch: details.lastReplenishedEpoch.toBigInt(),
    };
  }

  return capacityDetails;
}

export async function getControlKeys(apiPromise: ApiPromise, msaId: number): Promise<string[]> {
  const keyInfoResponse = (await (apiPromise.rpc as any).msa.getKeysByMsaId(msaId)).toHuman();
  const keys = keyInfoResponse?.msa_keys;
  if (keys) {
    console.info('Successfully found keys.', keys);
    return keys;
  }
  throw Error(`Keys not found for ${msaId}`);
}

export async function getPublicKeys(apiPromise: ApiPromise, msaId: number, intentName: string): Promise<string[]> {
  let publicKeys: string[] = [];

  const intent = await getIntent(apiPromise, intentName);
  if (!intent) {
    throw new Error(`Unable to resolve intent for "${intentName}`);
  }
  const payload = await apiPromise.call.statefulStorageRuntimeApi.getItemizedStorageV2(msaId, intent.intentId);
  if (payload.isOk) {
    const payloads = payload.asOk.items.map((item) => ({
      schemaId: item.schemaId.toNumber(),
      payload: item.payload.toHex(),
    }));

    // Resolve all schema models
    const payloadsWithModels = await Promise.all(payloads.map(async (p) => {
      const model = await getSchemaModel(apiPromise, intent, p.schemaId);
      return { payload: p, model }
    }));

    const decodedPayloads = payloadsWithModels.map((p) => decodeAvroPayload(p.payload.payload, p.model!));
    publicKeys = decodedPayloads
      .map((dp, i) => {
        if (!!dp.publicKey) {
          return u8aToHex(dp.publicKey || [])
        }
        return `${i}: ${dp}`;
      });
    // .filter((dp) => !!dp?.publicKey)
    // .map((dp) => u8aToHex(dp.publicKey || []));
  }

  return publicKeys;
}

export async function getIntent(apiPromise: ApiPromise, intentName: string): Promise<Intent | undefined> {
  let intent = intentCache.get(intentName);

  if (!intent) {
    const intentLookupResponse = await apiPromise.call.schemasRuntimeApi.getRegisteredEntitiesByName(intentName);
    if (intentLookupResponse.isSome) {
      const unwrappedResponse = intentLookupResponse.unwrap();
      if (unwrappedResponse.length > 0) {
        const intentId = unwrappedResponse[0].entityId.asIntent.toNumber();
        const intentResponse = await apiPromise.call.schemasRuntimeApi.getIntentById(intentId, true);
        if (intentResponse.isSome) {
          const intentScale = intentResponse.unwrap();
          intent = {
            intentId,
            payloadLocation: intentScale.payloadLocation.toString(),
            settings: intentScale.settings.map((s) => s.toString()),
            schemas: intentScale.schemaIds.unwrapOr([]).map((s) => ({ schemaId: s.toNumber(), model: undefined })),
          };
        }
      }
    }
  }

  return intent;
}

export async function getContentHashAndLatestSchemaForIntent(apiPromise: ApiPromise, msaId: number, intentName: string) {
  let contentHash = 0;

  const intent = await getIntent(apiPromise, intentName);
  if (!intent) {
    throw new Error(`Unable to resolve intent "${intentName}"`);
  }
  const schemaId = intent.schemas[intent.schemas.length - 1].schemaId;
  const response = await apiPromise.call.statefulStorageRuntimeApi.getItemizedStorageV2(msaId, intent.intentId);
  if (response.isOk) {
    contentHash = response.asOk.contentHash.toNumber();
  }

  return { intent, schemaId, contentHash };
}

export async function getSchemaModel(apiPromise: ApiPromise, intent: Intent, schemaId: number): Promise<string | undefined> {
  let model: string | undefined = intent.schemas.find((s) => s.schemaId === schemaId)?.model ?? undefined;

  if (!model) {
    const response = await apiPromise.call.schemasRuntimeApi.getSchemaById(schemaId);
    if (response.isSome) {
      model = hexToString(response.unwrap().model.toString());
      const schema = intent.schemas.find((s) => s.schemaId === schemaId);
      if (schema) {
        schema.model = model;
      }
    }
  }
  return model;
}
