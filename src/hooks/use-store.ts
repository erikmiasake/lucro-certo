import { useSyncExternalStore } from 'react';
import { getState, subscribe } from '@/lib/store';

export function useStore() {
  return useSyncExternalStore(subscribe, getState);
}
