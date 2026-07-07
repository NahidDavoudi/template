import { storeConfig } from '../config/bootstrap';
import { pickVariantSet } from '../lib/utils/imageUrl';

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

export function initTheme(): void {
  const root = document.documentElement;
  const { theme, fonts } = storeConfig;

  Object.entries(VAR_MAP).forEach(([key, cssVar]) => {
    if (theme[key as keyof typeof theme]) root.style.setProperty(cssVar, theme[key as keyof typeof theme]);
  });

  if (fonts?.body) root.style.setProperty('--font-vazir', `'${fonts.body}', sans-serif`);
  if (fonts?.display) root.style.setProperty('--font-display', `'${fonts.display}', sans-serif`);
  if (fonts?.felipa) root.style.setProperty('--font-felipa', `'${fonts.felipa}', sans-serif`);

  const faviconSrc = pickVariantSet(storeConfig.faviconVariants, 'thumb') || storeConfig.favicon;
  if (faviconSrc) {
    let link = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    link.href = faviconSrc;
  }

  const themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (themeColor && theme?.background) themeColor.content = theme.background;

  if (theme?.background) document.body?.style.setProperty('background-color', theme.background);
  if (theme?.bodyText) document.body?.style.setProperty('color', theme.bodyText);

  document.title = storeConfig.name;
}

export function pageTitle(title?: string): void {
  document.title = title || storeConfig.name;
}

export function setMetaDescription(description?: string): void {
  let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = description || '';
}
