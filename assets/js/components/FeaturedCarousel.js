import { storeConfig } from '../config/bootstrap.js';
import FeaturedPosterCard from './FeaturedPosterCard.js';
import PillCarousel from './PillCarousel.js';
import DOM from '../utils/dom.js';

let _uid = 0;

function nextId() {
  _uid += 1;
  return `fc-${_uid}`;
}

const FeaturedCarousel = {
  render(data = {}) {
    const cfg = storeConfig.carousel.featured;
    const { home } = storeConfig.texts;
    const id = data.id || nextId();
    const title = data.title || home.featured;
    const viewAllHref = data.viewAllHref || cfg.viewAllHref;
    const viewAllLabel = data.viewAllLabel || home.viewAll;

    return `
      <section class="py-14 md:py-20 featured-carousel-section overflow-visible" data-carousel-id="${id}"
               style="background-color:${cfg.backgroundColor}">
        <div class="max-w-[1280px] mx-auto relative">
          <div class="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-6">
            <h2 class="text-2xl md:text-4xl font-bold text-body text-right">${title}</h2>
            <a href="${viewAllHref}" data-link
               class="text-muted text-xs md:text-sm hover:text-accent flex flex-row-reverse items-center gap-1 transition-colors shrink-0">
              <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i><span>${viewAllLabel}</span>
            </a>
          </div>
          <div class="px-2 md:px-6" data-featured-pill-wrap="${id}">
            ${PillCarousel.render({ id, background: cfg.backgroundColor })}
          </div>
        </div>
      </section>`;
  },

  bind(container, callbacks = {}) {
    const cfg = storeConfig.carousel.featured;
    const pillRoot = container.querySelector('.pill-carousel');
    if (!pillRoot) return null;

    const products = callbacks.products || [];
    const itemsHtml = products.map((p) => FeaturedPosterCard.render(p, { variant: 'pill' }));
    const items = products.map((p) => ({
      name: p.name,
      href: DOM.hashHref('product', { id: p.id }),
      tooltipText: p.name,
    }));

    return PillCarousel.bind(pillRoot, {
      items,
      itemsHtml,
      config: cfg.pill,
      background: cfg.backgroundColor,
    });
  },

  destroy(container) {
    const pillRoot = container?.querySelector('.pill-carousel');
    PillCarousel.destroy(pillRoot);
  },
};

export default FeaturedCarousel;
