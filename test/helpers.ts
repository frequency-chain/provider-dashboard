import { ExtrinsicStatus } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { screen } from '@testing-library/svelte';
import { Hash } from 'crypto';

// Helper function to get text that is broken up into multiple elements (->stackExchange)
export const getByTextContent = (text: string) => {
  // Passing custom matcher function to `getByText`
  return screen.getByText((_content, element) => {
    const hasText = (element) => element.textContent === text;
    const elementHasText = hasText(element);
    const childrenDontHaveText = Array.from(element?.children || []).every((child) => !hasText(child));
    return elementHasText && childrenDontHaveText;
  });
};

export function createMockSubmittableResult(overrides: Partial<ISubmittableResult> = {}): ISubmittableResult {
  const defaultStatus: ExtrinsicStatus = {
    isInBlock: false,
    isFinalized: true,
    isError: false,
    isBroadcast: false,
    isInvalid: false,
    isUsurped: false,
    asFinalized: { toHex: () => '0x123456' } as any,
    asInBlock: { toHex: () => '0x0' } as any,
    toString: () => 'Finalized',
  } as unknown as ExtrinsicStatus;

  const defaultTxHash: Hash = u8aToHex(new Uint8Array(32)) as unknown as Hash;

  return {
    dispatchError: undefined,
    dispatchInfo: undefined,
    internalError: undefined,
    events: [],
    status: defaultStatus,
    isCompleted: true,
    isError: false,
    isFinalized: true,
    isInBlock: false,
    isWarning: false,
    txHash: defaultTxHash,
    txIndex: 0,
    filterRecords: (_section: string, _method: string) => [],
    findRecord: (_section: string, _method: string) => undefined,
    toHuman: (_isExtended?: boolean) => ({}),
    ...overrides,
  } as ISubmittableResult;
}
