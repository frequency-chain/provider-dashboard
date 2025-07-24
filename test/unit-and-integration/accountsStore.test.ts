import {
  Account,
  Accounts,
  allAccountsStore,
  nonProviderAccountsStore,
  providerAccountsStore,
  unusedKeyAccountsStore,
} from '$lib/stores/accountsStore';
import Keyring from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { get } from 'svelte/store';

describe('derived stores have the correct data', () => {
  const keyring = new Keyring({ type: 'sr25519' });
  const alice: KeyringPair = { ...keyring.addFromUri('//Alice'), ...{ meta: { name: '//Alice' } } };
  const bob: KeyringPair = { ...keyring.addFromUri('//Bob'), ...{ meta: { name: '//Bob' } } };
  const charlie: KeyringPair = { ...keyring.addFromUri('//Charlie'), ...{ meta: { name: '//Charlie' } } };

  beforeAll(() => {
    const provider: Account = {
      address: alice.address,
      isProvider: true,
      msaId: 1,
      providerName: 'test',
      keyringPair: alice,
    };
    const msaOnly: Account = {
      address: bob.address,
      isProvider: false,
      msaId: 2,
      keyringPair: bob,
    };
    const unused: Account = {
      address: charlie.address,
      isProvider: false,
      msaId: 0,
      keyringPair: charlie,
    };
    allAccountsStore.set(
      new Map([
        [provider.address, provider],
        [msaOnly.address, msaOnly],
        [unused.address, unused],
      ])
    );
  });
  it('allAccountsStore', () => {
    const accounts: Accounts = get(allAccountsStore);
    expect(accounts.size).toBe(3);
  });
  it('providerAccountsStore', () => {
    const accounts: Accounts = get(providerAccountsStore);
    expect(accounts.size).toBe(1);
    expect(accounts.get(alice.address)).not.toBeUndefined();
  });
  it('nonProviderAccountsStore', () => {
    const accounts: Accounts = get(nonProviderAccountsStore);
    expect(accounts.size).toBe(2);
    expect(accounts.get(bob.address)).not.toBeUndefined();
    expect(accounts.get(charlie.address)).not.toBeUndefined();
  });
  it('unusedKeyAccountsStore', () => {
    const accounts: Accounts = get(unusedKeyAccountsStore);
    expect(accounts.size).toBe(1);
    expect(accounts.get(charlie.address)).not.toBeUndefined();
  });
});
