import { storeConfig } from '../../config/bootstrap';
import type { ToastPalette } from '../../config/storeConfig';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastEntry {
  id: number;
  message: string;
  type: ToastType;
  palette: ToastPalette;
}

type Listener = (toasts: ToastEntry[]) => void;

const VALID = new Set<ToastType>(['success', 'error', 'warning', 'info']);
let _toasts: ToastEntry[] = [];
const _listeners = new Set<Listener>();
let _seq = 0;

function palette(type: ToastType): ToastPalette {
  return (
    storeConfig.ui?.toast?.[type] ||
    storeConfig.ui?.toast?.success || {
      bg: '#16a34a',
      text: '#ffffff',
      border: '#15803d',
    }
  );
}

function emit(): void {
  _listeners.forEach((cb) => cb(_toasts));
}

export function toast(message: string, type: ToastType | string = 'success', duration = 3000): void {
  const resolvedType = (VALID.has(type as ToastType) ? type : 'success') as ToastType;
  const id = ++_seq;
  _toasts = [..._toasts, { id, message, type: resolvedType, palette: palette(resolvedType) }];
  emit();
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export function dismissToast(id: number): void {
  _toasts = _toasts.filter((t) => t.id !== id);
  emit();
}

export function subscribeToast(listener: Listener): () => void {
  _listeners.add(listener);
  listener(_toasts);
  return () => _listeners.delete(listener);
}
