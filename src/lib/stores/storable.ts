import { writable } from 'svelte/store';
import { BROWSER } from 'esm-env';

export function storable<T>(key: string, data?: T) {
  const store = writable(data);
  const { subscribe, set, update } = store;
  const storage = BROWSER ? window?.localStorage : null;

  if (storage) {
    const storageValue = storage.getItem(key);
    if (storageValue) {
      set(storageValue ? JSON.parse(storageValue) : data);
    }
  }

  function toJson(value: unknown) {
    return JSON.stringify(value, (key, value) => (typeof value === 'bigint' ? value.toString() : value));
  }

  return {
    subscribe,
    set: (n: T) => {
      // storage?.setItem(key, toJson(n));
      set(n);
    },
    update: (cb: (value: T) => T) => {
      const new_cb = (old_value: T) => {
        const new_value = cb(old_value);
        // storage?.setItem(key, toJson(new_value));
        return new_value;
      };
      update(new_cb);
    },
  };
}
