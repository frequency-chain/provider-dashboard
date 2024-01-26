import { writable } from 'svelte/store';
import type { NetworkInfo } from "./networksStore";
import type { AccountInfo } from "./accountsStore";

export interface UserInfo {
    network: NetworkInfo;
    account?: AccountInfo;
  }
export const user = writable({});
