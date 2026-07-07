import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';
import { useStoreConfig } from '../context/ConfigContext';
import { pickBannerImage } from '../lib/utils/imageUrl';
import ImageWithFallback from './ImageWithFallback';
import type { PromoBanner } from '../types';
import 'swiper/css';
import 'swiper/css/pagination';

interface PromoPosterSliderProps {
  banners: PromoBanner[];
}

export function PromoPosterSlider({ banners }: PromoPosterSliderProps) {
  const cfg = useStoreConfig();
  const swiperConfig: SwiperOptions = {
    modules: [Autoplay, Pagination],
    loop: banners.length > 1,
    autoplay: { delay: cfg.promoSlider.autoplayMs, disableOnInteraction: false },
    pagination: { clickable: true },
    spaceBetween: 0,
    slidesPerView: 1,
  };

  if (!banners.length) return null;

  return (
    <section className="promo-poster-section py-10 md:py-14">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <Swiper {...swiperConfig} className={`${cfg.promoSlider.aspect} rounded-2xl overflow-hidden`}>
          {banners.map((b) => (
            <SwiperSlide key={b.id}>
              <div className="promo-poster-slide w-full h-full">
                <ImageWithFallback
                  src={pickBannerImage(b, 'large') || b.image_url}
                  alt={b.title || ''}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default PromoPosterSlider;
