import { storeConfig } from '../config/bootstrap.js';
import { renderImageWithFallback } from '../utils/imagePlaceholder.js';
import { pickProductImage } from '../utils/imageUrl.js';
import DOM from '../utils/dom.js';

const FeaturedPosterCard = {
  render(p, options = {}) {
    const { ui, carousel } = storeConfig;
    const isCurve = options.variant === 'curve';
    const isPill = options.variant === 'pill';
    const isMarquee = options.variant === 'marquee';
    const img = pickProductImage(p, 'medium');
    const href = DOM.hashHref('product', { id: p.id });
    const radius = isMarquee ? carousel.featured.curve?.cardRadius : null;
    const radiusStyle = radius != null ? `border-radius:${radius}px` : '';
    const radiusClass = isMarquee || isCurve || isPill ? '' : ui.cardRadius;
    const curveClass = isCurve ? 'featured-poster-curve' : '';
    const pillClass = isPill ? 'featured-poster-pill' : '';
    const curveStyle = isCurve
      ? 'width:var(--curve-card-w);height:var(--curve-card-h);border-radius:var(--curve-card-radius,16px)'
      : '';
    const pillStyle = isPill ? 'width:100%;height:100%;border-radius:var(--pill-card-radius,200px)' : '';
    const showTitleOverlay = !isPill;
    const Tag = isPill ? 'div' : 'a';
    const linkAttrs = isPill ? '' : `href="${href}" data-link`;

    return `
      <${Tag} ${linkAttrs}
         class="featured-poster group block h-full overflow-hidden ${isMarquee ? 'featured-poster--marquee' : ''} ${curveClass} ${pillClass} ${radiusClass}"
         style="${pillStyle || curveStyle || radiusStyle || ''}">
        <div class="featured-poster__media relative h-full bg-surface overflow-hidden ${isCurve ? 'rounded-[var(--curve-card-radius,16px)]' : ''} ${isPill ? 'rounded-[var(--pill-card-radius,200px)]' : ''}">
          ${renderImageWithFallback({
            src: img,
            alt: p.name,
            imgClass: `w-full h-full object-cover ${isMarquee || isCurve || isPill ? '' : 'transition-transform duration-700 ease-out group-hover:scale-[1.04]'}`,
            iconSize: 'w-12 h-12',
          })}
          ${showTitleOverlay ? `
          <div class="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
            <h3 class="text-white font-bold text-sm sm:text-base text-right leading-snug drop-shadow-sm line-clamp-2">${p.name}</h3>
          </div>` : ''}
        </div>
      </${Tag}>`;
  },

  bind() { /* router handles links */ },
};

export default FeaturedPosterCard;
