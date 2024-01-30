import { writable } from 'svelte/store';
import { Account } from './accountsStore';

export const user = writable<Account>(new Account());
