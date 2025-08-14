import type { Account } from '$lib/stores/accountsStore';
import { storable } from './storable';

export const user = storable<Account>('user', {
  address: '',
  isProvider: false,
  balances: { transferable: 0n, locked: 0n, total: 0n },
});
