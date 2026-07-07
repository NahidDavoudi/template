/**
 * core/storeSettings.ts — fetch /settings and merge into runtime store config
 * Backend = source of truth · store.config.js = fallback
 */
import { mergeStoreSettings, type RemoteSettings } from '../config/bootstrap';
import api from './api';

export async function loadStoreSettings(): Promise<void> {
  try {
    const data = (await api.settings.get()) as RemoteSettings | null | undefined;
    if (data) mergeStoreSettings(data);
  } catch (err) {
    console.warn('[StoreSettings] using local fallback:', (err as Error)?.message || err);
  }
}

export default loadStoreSettings;
