import { TxnStatus, type Activity } from '$lib/storeTypes';
import { storable } from './storable';
import { readonly } from 'svelte/store';
import type { EventRecord, ExtrinsicStatus } from '@polkadot/types/interfaces';
import type { ISubmittableResult } from '@polkadot/types/types';

//writableActivityLog: Oldest to Newest
const writableActivityLog = storable<Activity[]>('ActivityLog', []);
export const activityLog = readonly(writableActivityLog);

export const handleResult = async (result: ISubmittableResult) => {
  const txnId = result.txHash.toString();
  console.log('handleResult', txnId);
  const activity: Activity = parseActivity(txnId, result);
  addNewTxnStatus(activity);
};

export const handleTxnError = (txnId: string, errorMsg: string) => {
  addNewTxnStatus({ txnId, txnStatusItems: [`${errorMsg}`], txnStatus: TxnStatus.FAILURE });
};

const addNewTxnStatus = (activity: Activity) => {
  writableActivityLog.update((activities: Activity[]) => {
    const curActivity = activities.find((item) => item.txnId === activity.txnId);
    if (curActivity) {
      curActivity.txnStatus = activity.txnStatus;
      curActivity.txnStatusItems = curActivity.txnStatusItems.concat(activity.txnStatusItems);
    } else {
      activities = [activity, ...activities];
    }
    return activities;
  });
};

// how to display the transaction status as it is updated
export function parseActivity(
  txnId: string,
  {
    events = [],
    status,
  }: {
    events?: EventRecord[];
    status: ExtrinsicStatus;
  }
): Activity {
  const txnStatusItems = [];
  let txnStatus: Activity['txnStatus'] = TxnStatus.LOADING;
  try {
    if (status.isInvalid) {
      txnStatusItems.push('Invalid transaction');
    } else if (status.isBroadcast) {
      txnStatusItems.push(`Transaction is Broadcast`);
    } else if (status.isFinalized) {
      txnStatusItems.push(`Transaction is finalized in block hash ${status.asFinalized.toHex()}`);
      events.forEach(({ event }) => {
        if (event.method === 'ExtrinsicSuccess') {
          txnStatusItems.push('Transaction succeeded');
          txnStatus = TxnStatus.SUCCESS;
        } else if (event.method === 'ExtrinsicFailed') {
          txnStatusItems.push('Transaction failed. See chain explorer for details.');
          txnStatus = TxnStatus.FAILURE;
        }
      });
    } else if (status.isInBlock) {
      txnStatusItems.push(`Transaction is included in blockHash ${status.asInBlock.toHex()}`);
    } else {
      console.debug({ status });
    }
  } catch (e: any) {
    txnStatusItems.push('Error: ' + e.toString());
    txnStatus = TxnStatus.FAILURE;
  }
  return { txnStatusItems, txnStatus, txnId };
}

export const clearLog = () => {
  writableActivityLog.set([]);
};
