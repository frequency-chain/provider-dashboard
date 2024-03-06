import type { Account } from '$lib/stores/accountsStore';
import { storable } from './storable';

export const user = storable<Account>('user', { address: '', isProvider: false });
