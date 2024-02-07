import { formatBalance, hexToString } from '@polkadot/util';
import type { NetworkInfo } from './stores/networksStore';
import type { Account } from './stores/accountsStore';

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type WaitOptions = { interval?: number; timeout?: number };

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
  } catch (e: any) {
    console.error(e.toString());
    return false;
  }
}

export function isMainnet(url: string): boolean {
  try {
    const parsedURL: URL = new URL(url);
    return !!parsedURL.hostname.match(/^(0|1).rpc.frequency.xyz/)?.length;
  } catch (e: any) {
    console.error(e.toString());
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

export function formatNetwork(network: NetworkInfo): string {
  if (network.name === 'CUSTOM') {
    return network.name;
  }
  return `${network?.name ?? ''}: ${network?.endpoint?.toString().replace(/\/$/, '') ?? ''}`;
}

export function formatAccount(account: Account): string {
  return `${account.providerName}${account.providerName && ':'} ${account.address}`;
}

// create a URL-encoded mailto URL string using the provided parameters.
export function createMailto(to: string, subject?: string, body?: string): string {
  // this regex is not at all rigourous, it's just for preventing blatant errors
  const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/; // eslint-disable-line no-useless-escape
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
export const providerNameToHuman = (name: any): string => {
  return hexToString(name.toString());
};

export const balanceToHuman = (balance: bigint, token: string): string => {
  return formatBalance(balance, { withSiFull: true, withUnit: token, withZero: true, decimals: 8 });
};
