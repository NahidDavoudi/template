import { useEffect, useSyncExternalStore } from 'react';
import { storeConfig, subscribeConfig } from '../config/bootstrap';
import type { StoreConfig } from '../config/storeConfig';

function getSnapshot(): StoreConfig {
  return storeConfig;
}

export function useStoreConfig(): StoreConfig {
  return useSyncExternalStore(subscribeConfig, getSnapshot, getSnapshot);
}

export function useStoreName(): string {
  const cfg = useStoreConfig();
  return cfg.name;
}

/** Apply theme CSS variables + document title whenever config changes. */
export function useThemeApplier(): void {
  const cfg = useStoreConfig();
  useEffect(() => {
    const root = document.documentElement;
    const VAR_MAP: Record<string, string> = {
      primary: '--color-accent',
      primaryHover: '--color-accent-hover',
      background: '--color-dark',
      surface: '--color-dark-2',
      card: '--color-dark-3',
      border: '--color-border',
      muted: '--color-muted',
      textDim: '--color-text-dim',
      bodyText: '--color-body-text',
    };
    Object.entries(VAR_MAP).forEach(([key, cssVar]) => {
      const val = cfg.theme[key as keyof typeof cfg.theme];
      if (val) root.style.setProperty(cssVar, val);
    });
    if (cfg.fonts?.body) root.style.setProperty('--font-vazir', `'${cfg.fonts.body}', sans-serif`);
    if (cfg.fonts?.display) root.style.setProperty('--font-display', `'${cfg.fonts.display}', sans-serif`);
    if (cfg.fonts?.felipa) root.style.setProperty('--font-felipa', `'${cfg.fonts.felipa}', sans-serif`);
    if (cfg.theme?.background) document.body.style.setProperty('background-color', cfg.theme.background);
    if (cfg.theme?.bodyText) document.body.style.setProperty('color', cfg.theme.bodyText);
    document.title = cfg.name;
  }, [cfg]);
}
