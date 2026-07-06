import { escapeHtml } from '../utils/htmlEscape.js';
import { escapeAttr } from '../utils/htmlEscape.js';
import { pickCategoryImage } from '../utils/imageUrl.js';
import DOM from '../utils/dom.js';

function renderCircleMedia(c) {
  const img = pickCategoryImage(c, 'medium');
  if (img) {
    return `
      <img src="${escapeAttr(img)}" alt="${escapeAttr(c.name)}"
           class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
           onerror="this.classList.add('hidden');this.nextElementSibling.classList.remove('hidden')">
      <div class="hidden absolute inset-0 flex items-center justify-center text-muted/30">
        <i data-lucide="image" class="w-10 h-10 md:w-12 md:h-12"></i>
      </div>`;
  }
  return `
    <div class="absolute inset-0 flex items-center justify-center text-muted/30">
      <i data-lucide="image" class="w-10 h-10 md:w-12 md:h-12"></i>
    </div>`;
}

const CategoryCircles = {
  render(categories = [], sectionTitle = 'دسته‌بندی‌ها') {
    if (!categories.length) {
      return `
        <section class="home-category-circles py-12 md:py-16 bg-body border-t border-b border-border">
          <div class="max-w-[1280px] mx-auto px-4 md:px-6 text-center text-sm text-muted py-8">
            دسته‌بندی‌ای یافت نشد
          </div>
        </section>`;
    }

    const items = categories.map((c) => {
      const slug = c.slug || c.name;
      const name = escapeHtml(c.name);
      const count = c.product_count
        ? `<p class="text-[11px] text-muted/60 mt-1">${c.product_count} محصول</p>`
        : '';

      return `
        <a href="${DOM.hashHref('shop', { category: slug })}" data-link
           class="home-category-circle group flex flex-col items-center gap-3 shrink-0 w-[140px] md:w-[160px]">
          <div class="home-category-circle__avatar relative w-[120px] h-[120px] md:w-[144px] md:h-[144px] rounded-full border border-border bg-surface overflow-hidden transition-colors duration-300 group-hover:border-white">
            ${renderCircleMedia(c)}
          </div>
          <div class="text-center">
            <span class="block text-sm text-muted group-hover:text-body transition-colors duration-300 leading-snug">${name}</span>
            ${count}
          </div>
        </a>`;
    }).join('');

    return `
      <section class="home-category-circles py-12 md:py-16 bg-body border-t border-b border-border">
        <div class="max-w-[1280px] mx-auto px-4 md:px-6">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl md:text-3xl font-bold text-body text-right">${escapeHtml(sectionTitle)}</h2>
            <a href="#/categories" data-link class="text-muted text-xs md:text-sm hover:text-body flex flex-row-reverse items-center gap-1 transition-colors shrink-0">
              <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i><span>همه</span>
            </a>
          </div>
          <div class="home-category-circles__row flex items-start gap-6 md:gap-8 overflow-x-auto pb-2">
            ${items}
          </div>
        </div>
      </section>`;
  },

  bind() { /* router handles links */ },
};

export default CategoryCircles;
