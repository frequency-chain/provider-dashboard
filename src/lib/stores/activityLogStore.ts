import { options } from '@frequency-chain/api-augment';
import type { ApiPromise, WsProvider } from '@polkadot/api';
import type { VoidFn } from '@polkadot/api/types';
import type { GenericEvent } from '@polkadot/types';
import { writable } from 'svelte/store';

export const activityLog = writable<GenericEvent[]>();

let unsubscribeFromEvents: VoidFn | undefined;

export const listenToEvents = async (api: ApiPromise) => {
  unsubscribeFromEvents = await api.query.system.events((events) => {
    events.forEach(({ event }) => {
      console.log('EVENT:', event);
      activityLog.update((activity) => (activity = [event, ...activity]));

      const types = event.typeDef;
      if (event.section === 'handles' && event.method === 'HandleClaimed') {
        event.data.forEach((data, index) => {
          if (types[index].type === 'Bytes') {
            console.log(data.toHuman() as string);
            // Once we get here, go ahead and unsubscribe
            unsubscribeFromEvents?.();
          }
        });
      }
    });
  });
};
