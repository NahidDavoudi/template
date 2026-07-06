import { escapeHtml } from '../utils/htmlEscape.js';
import DOM from '../utils/dom.js';

const CategoryCircles = {
  render(categories = []) {
    if (!categories.length) {
      return `
        <section class="home-category-circles py-10 md:py-14 bg-body border-b border-border">
          <div class="max-w-[1280px] mx-auto px-4 md:px-6 text-center text-sm text-muted">
            دسته‌بندی‌ای یافت نشد
          </div>
        </section>`;
    }

    const items = categories.map((c) => {
      const slug = c.slug || c.name;
      const name = escapeHtml(c.name);

      return `
        <a href="${DOM.hashHref('shop', { category: slug })}" data-link
           class="home-category-circle group flex flex-col items-center gap-3 shrink-0 w-[88px] md:w-[104px]">
          <div class="home-category-circle__avatar w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-full border border-border bg-surface flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:border-white"
               aria-hidden="true">
            <i data-lucide="circle-dashed" class="w-7 h-7 md:w-8 md:h-8 text-muted/40"></i>
          </div>
          <span class="text-xs text-muted text-center leading-tight group-hover:text-body transition-colors duration-300 line-clamp-2 w-full">${name}</span>
        </a>`;
    }).join('');

    return `
      <section class="home-category-circles py-10 md:py-14 bg-body border-b border-border">
        <div class="max-w-[1280px] mx-auto px-4 md:px-6">
          <div class="home-category-circles__row flex items-start gap-6 md:gap-10 overflow-x-auto pb-1 justify-start md:justify-center">
            ${items}
          </div>
        </div>
      </section>`;
  },

  bind() { /* router handles links */ },
};

export default CategoryCircles;
