import type { ApiPromise } from '@polkadot/api';
import { formatBalance, hexToString, isFunction } from '@polkadot/util';
import { clsx, type ClassValue } from 'clsx';
import { get } from 'svelte/store';
import { twMerge } from 'tailwind-merge';
import type { Account, Accounts } from './stores/accountsStore';
import { NetworkType, type NetworkInfo } from './stores/networksStore';
import { user } from './stores/userStore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface WaitOptions {
  interval?: number;
  timeout?: number;
}

// This is used only in connections.  In testing, use the waitFor function provided by
// vitest.
export async function waitFor(
  predicate: () => Promise<boolean> | boolean,
  { interval = 500, timeout = 36000 }: WaitOptions = {}
): Promise<boolean> {
  const asyncPredicate = () => Promise.resolve(predicate());
  let elapsed = 0;
  while (!(await asyncPredicate())) {
    if (elapsed > timeout) {
      throw Error('Timeout');
    }
    await sleep(interval);
    elapsed += interval;
  }
  return true;
}

export function isLocalhost(url: string): boolean {
  try {
    const parsedURL: URL = new URL(url);
    return parsedURL.hostname.includes('localhost') || parsedURL.hostname.includes('127.0.0.1');
  } catch (e: unknown) {
    console.error((e as Error).toString());
    return false;
  }
}

export function isMainnet(url: string): boolean {
  try {
    const parsedURL: URL = new URL(url);
    return !!parsedURL.hostname.match(/^(0|1).rpc.frequency.xyz/)?.length;
  } catch (e: unknown) {
    console.error((e as Error).toString());
    return false;
  }
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

export function selectNetworkOptions(networks: NetworkInfo[]) {
  return networks.map((network) => {
    let label = `${network?.name ?? ''}: ${network?.endpoint?.toString().replace(/\/$/, '') ?? ''}`;
    if (network.id === NetworkType.CUSTOM) {
      label = network.name;
    }
    return {
      optionLabel: label,
      value: network.name,
    };
  });
}

export function selectAccountOptions(accounts: Accounts) {
  const accountsArray = Array.from(accounts.values());

  return accountsArray.map((account) => {
    let optionLabel = `${account.display}${account.display && ':'} ${account.address}`;
    if (account.isProvider) {
      optionLabel = `${account.providerName || `Provider #${account.msaId}`}: ${account.address}`;
    }
    return {
      optionLabel,
      value: account.address,
    };
  });
}

// create a URL-encoded mailto URL string using the provided parameters.
export function createMailto(to: string, subject?: string, body?: string): string {
  // this regex is not at all rigourous, it's just for preventing blatant errors
  const emailRegex = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/;
  const matches = to.match(emailRegex);
  if (matches === null) {
    throw `to is not an email address: ${to}`;
  }

  const mailtoUrl = [
    'mailto:',
    to,
    '?subject=',
    encodeURIComponent(subject || ''),
    '&body=',
    encodeURIComponent(body || ''),
  ];
  return mailtoUrl.join('');
}

// Convert the provider name in hex to a human-readable value.
export const providerNameToHuman = (name: { toString: () => string }): string => {
  return hexToString(name.toString());
};

export const balanceToHuman = (balance: bigint, token: string): string => {
  return formatBalance(balance, { withSiFull: true, withUnit: token, withZero: true, decimals: 8 });
};

export const getExtension = async (account: Account) => {
  try {
    const extension = await import('@polkadot/extension-dapp');
    const thisWeb3FromSource = extension.web3FromSource;
    const thisWeb3Enable = extension.web3Enable;
    if (isFunction(thisWeb3FromSource) && isFunction(thisWeb3Enable)) {
      const extensions = await thisWeb3Enable('Frequency parachain provider dashboard: Adding Keys');
      if (extensions.length !== 0 && account.injectedAccount?.meta.source) {
        return await thisWeb3FromSource(account.injectedAccount.meta.source);
      }
    }
    console.error('No wallet extensions found!');
  } catch (e) {
    console.error('Error getting extension:', e);
  }
  return undefined;
};

export async function checkFundsForExtrinsic(api: ApiPromise, extrinsic: any, address: string, additionalCost = 0n) {
  const { partialFee } = await extrinsic.paymentInfo(address);
  // Get estimated total cost of txn
  const estTotalCost = partialFee.toBigInt() + BigInt(additionalCost);
  // Check for adequate funds
  const existentialDeposit = BigInt(api.consts.balances.existentialDeposit.toString());
  const userTotalBalance = BigInt(get(user).balances.total);
  const transferable = userTotalBalance - existentialDeposit;
  if (transferable < estTotalCost) throw new Error('User does not have sufficient funds.');
}
