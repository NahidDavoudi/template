/**
 * pages/home.js
 */
import api from '../core/api.js';
import Router from '../core/router.js';
import ProductCard from '../components/ProductCard.js';
import CategoryCircles from '../components/CategoryCircles.js';
import FeaturedCarousel from '../components/FeaturedCarousel.js';
import HeroSection from '../components/HeroSection.js';
import { storeConfig } from '../config/bootstrap.js';

const SWIPER_DEFAULTS = {
  slidesPerView: 1.5,
  spaceBetween: 16,
  loop: true,
  breakpoints: {
    480: { slidesPerView: 2.2 },
    640: { slidesPerView: 2.5 },
    768: { slidesPerView: 3 },
    1024: { slidesPerView: 4 },
  },
};

let _productsSwiper = null;

function bindProductCards(container) {
  container.querySelectorAll('.swiper-slide').forEach((slide) => {
    ProductCard.bind(slide, {
      onAddToCart: async (id) => {
        await api.cart.add(id, 1);
        window.loadCartCount?.();
        api.utils.toast('به سبد اضافه شد', 'success', 2000);
      },
    });
  });
}

function setHomeTexts() {
  const { home, newsletter } = storeConfig.texts;
  const newestTitle = document.getElementById('newest-title');
  const newestAll = document.getElementById('newest-all');
  const nlTitle = document.getElementById('newsletter-title');
  const nlSub = document.getElementById('newsletter-subtitle');

  if (newestTitle) newestTitle.textContent = home.newest;
  if (newestAll) newestAll.querySelector('span').textContent = home.viewAll;
  if (nlTitle) nlTitle.textContent = newsletter.title;
  if (nlSub) nlSub.textContent = newsletter.subtitle;
}

async function loadHomeCategories() {
  const el = document.getElementById('categories-section');
  if (!el) return;

  try {
    const cats = await api.categories.list();
    const arr = Array.isArray(cats) ? cats : (cats.data || []);
    el.innerHTML = CategoryCircles.render(arr, storeConfig.texts?.home?.categoriesTitle || 'دسته‌بندی‌ها');
  } catch (e) {
    console.warn('Categories error:', e);
    el.innerHTML = CategoryCircles.render([]);
  }
}

Router.onEnter('home', async function () {
  setHomeTexts();

  const heroEl = document.getElementById('hero-section');
  if (heroEl) {
    heroEl.innerHTML = HeroSection.render();
    HeroSection.bind(heroEl);
    if (window.lucide) lucide.createIcons({ nodes: [heroEl] });
  }

  const featuredEl = document.getElementById('featured-section');
  if (featuredEl) {
    FeaturedCarousel.destroy(featuredEl);
    try {
      const featured = await api.products.list({ featured: 1 });
      const arr = Array.isArray(featured) ? featured : (featured.data || []);

      if (arr.length) {
        featuredEl.innerHTML = FeaturedCarousel.render({ products: arr });
        FeaturedCarousel.bind(featuredEl, { products: arr });
      } else {
      featuredEl.innerHTML = '';
    }
  } catch (e) {
    console.warn('Featured products error:', e);
    featuredEl.innerHTML = '';
  }
  }

  await loadHomeCategories();

  try {
    const data = await api.products.list({ limit: 10 });
    const wrap = document.getElementById('products-wrapper');
    const arr = data.data || [];

    if (wrap && arr.length) {
      _productsSwiper?.destroy?.(true, true);
      wrap.innerHTML = arr.map((p) => `<div class="swiper-slide">${ProductCard.render(p)}</div>`).join('');
      bindProductCards(wrap.closest('.products-swiper') || wrap);
      _productsSwiper = new Swiper('.products-swiper', {
        ...SWIPER_DEFAULTS,
        navigation: { prevEl: '.carousel-nav-prev-prods', nextEl: '.carousel-nav-next-prods' },
      });
    }
  } catch (e) {
    console.warn('Products error:', e);
  }

  if (window.lucide) lucide.createIcons();
});
