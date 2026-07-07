import { useSyncExternalStore } from 'react';
import { dismissToast, subscribeToast, type ToastEntry } from '../lib/utils/toast';

function getSnapshot(): ToastEntry[] {
  return _latest;
}

let _latest: ToastEntry[] = [];
const _subscribers = new Set<() => void>();

subscribeToast((toasts) => {
  _latest = toasts;
  _subscribers.forEach((cb) => cb());
});

function subscribe(cb: () => void): () => void {
  _subscribers.add(cb);
  return () => _subscribers.delete(cb);
}

export function useToasts(): { toasts: ToastEntry[]; dismiss: (id: number) => void } {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { toasts, dismiss: dismissToast };
}
