import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Autoplay, Pagination } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';
import { useStoreConfig } from '../context/ConfigContext';
import { pickProductImage } from '../lib/utils/imageUrl';
import ImageWithFallback from './ImageWithFallback';
import type { Product } from '../types';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface FeaturedCarouselProps {
  products: Product[];
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const cfg = useStoreConfig();
  const { home } = cfg.texts;
  const carousel = cfg.carousel;

  const swiperConfig: SwiperOptions = {
    modules: [EffectCoverflow, Navigation, Autoplay, Pagination],
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 1.4,
    loop: products.length > 3,
    spaceBetween: 16,
    autoplay: { delay: 3500, disableOnInteraction: false },
    coverflowEffect: { rotate: 0, stretch: 0, depth: 220, modifier: 1.5, slideShadows: false },
    navigation: { nextEl: '.featured-next', prevEl: '.featured-prev' },
    pagination: { clickable: true },
    breakpoints: {
      480: { slidesPerView: 2 },
      768: { slidesPerView: 2.6 },
      1024: { slidesPerView: 3.2 },
    },
  };

  return (
    <section
      className="py-14 md:py-20 featured-carousel-section overflow-visible"
      style={{ backgroundColor: carousel.featured.backgroundColor }}
    >
      <div className="max-w-[1280px] mx-auto relative">
        <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-bold text-body text-right">{home.featured}</h2>
          <Link
            to={carousel.featured.viewAllHref}
            className="text-muted text-xs md:text-sm hover:text-accent flex flex-row-reverse items-center gap-1 transition-colors shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{home.viewAll}</span>
          </Link>
        </div>
        <div className="px-2 md:px-6">
          <Swiper {...swiperConfig} className="!pb-12">
            {products.map((p) => (
              <SwiperSlide key={p.id} className="!w-[260px] md:!w-[300px]">
                <Link to={`/product?id=${p.id}`} className="block iris-card rounded-2xl overflow-hidden bg-card border border-border">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                    <ImageWithFallback
                      src={pickProductImage(p, 'large')}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 to-transparent">
                      <p className="text-[10px] text-white/70 uppercase tracking-wide">{p.category_name}</p>
                      <h3 className="text-sm font-semibold text-white line-clamp-1">{p.name}</h3>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex items-center gap-3 mt-4 justify-center">
            <button type="button" className="featured-prev btn btn-glass btn-icon" aria-label="قبلی">‹</button>
            <button type="button" className="featured-next btn btn-glass btn-icon" aria-label="بعدی">›</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCarousel;
