export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type WaitOptions = { interval?: number; timeout?: number };

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
