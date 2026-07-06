import { escapeAttr, escapeHtml } from './htmlEscape.js';

export function renderImagePlaceholder(iconSize = 'w-10 h-10') {
  return `<div class="image-fallback w-full h-full flex items-center justify-center text-muted/50 bg-surface">
    <i data-lucide="image" class="${iconSize}" aria-hidden="true"></i>
  </div>`;
}

export function renderImageWithFallback({
  src = '',
  alt = '',
  imgClass = 'w-full h-full object-cover',
  iconSize = 'w-10 h-10',
  hoverSrc = '',
} = {}) {
  const safeAlt = escapeAttr(alt);
  const safeSrc = escapeAttr(src);
  const safeHoverSrc = hoverSrc ? escapeAttr(hoverSrc) : '';
  if (!src) return renderImagePlaceholder(iconSize);

  const primaryClass = `${imgClass} product-card__img--primary`.trim();
  const hoverImg = safeHoverSrc
    ? `<img src="${safeHoverSrc}" alt="" aria-hidden="true" class="${imgClass} product-card__img--hover" loading="lazy">`
    : '';
  const mediaWrap = safeHoverSrc ? 'product-card__media relative w-full h-full' : '';

  const primaryImg = `<img src="${safeSrc}" alt="${safeAlt}" class="${primaryClass}"
    onerror="this.classList.add('hidden');this.parentElement.querySelector('.image-fallback')?.classList.remove('hidden')">`;
  const fallback = `<div class="image-fallback hidden absolute inset-0 flex items-center justify-center text-muted/40 bg-surface">
    <i data-lucide="image" class="${iconSize}" aria-hidden="true"></i>
  </div>`;

  if (safeHoverSrc) {
    return `<div class="${mediaWrap}">${hoverImg}${primaryImg}${fallback}</div>`;
  }

  return `${primaryImg}${fallback}`;
}
