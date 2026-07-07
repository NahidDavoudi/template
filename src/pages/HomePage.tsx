import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';
import { ChevronLeft } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import HeroSection from '../components/HeroSection';
import FeaturedCarousel from '../components/FeaturedCarousel';
import PromoPosterSlider from '../components/PromoPosterSlider';
import ProductCard from '../components/ProductCard';
import type { Product, PromoBanner } from '../types';
import 'swiper/css';
import 'swiper/css/navigation';

export function HomePage() {
  const cfg = useStoreConfig();
  const { home } = cfg.texts;
  usePageTitle(cfg.name);

  const [featured, setFeatured] = useState<Product[]>([]);
  const [newest, setNewest] = useState<Product[]>([]);
  const [banners, setBanners] = useState<PromoBanner[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.products.list({ featured: 1 });
        setFeatured(data.data || []);
      } catch {
        /* noop */
      }
      try {
        const raw = await api.promoBanners.list();
        const arr = (raw && (Array.isArray(raw) ? raw : ((raw as { data?: PromoBanner[] })?.data || []))) || [];
        setBanners(arr.length ? arr : cfg.promoSlider.fallbackBanners);
      } catch {
        setBanners(cfg.promoSlider.fallbackBanners);
      }
      try {
        const data = await api.products.list({ limit: 10 });
        setNewest(data.data || []);
      } catch {
        /* noop */
      }
    })();
  }, [cfg.promoSlider.fallbackBanners]);

  const swiperConfig: SwiperOptions = {
    modules: [Navigation, Autoplay],
    slidesPerView: 1.5,
    spaceBetween: 16,
    loop: newest.length > 4,
    navigation: { nextEl: '.carousel-nav-next-prods', prevEl: '.carousel-nav-prev-prods' },
    autoplay: { delay: 4000, disableOnInteraction: false },
    breakpoints: {
      480: { slidesPerView: 2.2 },
      640: { slidesPerView: 2.5 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 },
    },
  };

  return (
    <div>
      <HeroSection />

      {featured.length > 0 && <FeaturedCarousel products={featured} />}

      {banners.length > 0 && <PromoPosterSlider banners={banners} />}

      <section className="py-14 md:py-20 bg-surface">
        <div className="max-w-[1280px] mx-auto relative">
          <div className="flex items-center justify-between mb-8 px-4 md:px-6">
            <h2 className="text-2xl md:text-4xl font-bold text-body text-right">{home.newest}</h2>
            <Link to="/shop" className="text-muted text-xs md:text-sm hover:text-body flex flex-row-reverse items-center gap-1 transition-colors shrink-0">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{home.viewAll}</span>
            </Link>
          </div>
          <div className="products-swiper px-4 md:px-6 overflow-hidden">
            <Swiper {...swiperConfig}>
              {newest.map((p) => (
                <SwiperSlide key={p.id}>
                  <ProductCard product={p} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="carousel-nav-row flex items-center gap-3 mt-6 px-4 md:px-6 justify-start">
            <button type="button" className="carousel-nav-prev-prods swiper-nav-btn btn-glass" aria-label="قبلی">‹</button>
            <button type="button" className="carousel-nav-next-prods swiper-nav-btn btn-glass" aria-label="بعدی">›</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
