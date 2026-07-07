import { useState } from 'react';
import { useStoreConfig } from '../context/ConfigContext';
import { pickImageUrl } from '../lib/utils/imageUrl';
import ImageWithFallback from './ImageWithFallback';
import type { ImageVariant } from '../types';

interface ProductGalleryProps {
  images: ImageVariant[];
  name: string;
  refCode: string;
}

export function ProductGallery({ images, name, refCode }: ProductGalleryProps) {
  const cfg = useStoreConfig();
  const t = cfg.texts.product;
  const valid = images.filter((img) => pickImageUrl(img, 'thumb') || pickImageUrl(img, 'large'));
  const [active, setActive] = useState(0);
  const mainSrc = valid.length ? pickImageUrl(valid[active], 'large') : '';

  return (
    <div className="product-gallery">
      <p className="text-[10px] text-muted tracking-widest mb-3 text-right" dir="ltr">{t.refPrefix} {refCode}</p>
      <div className="flex gap-3 md:gap-4 items-start">
        <div className="flex flex-col gap-2 shrink-0">
          {valid.length ? (
            valid.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors bg-surface ${
                  i === active ? 'border-body' : 'border-transparent hover:border-black/20'
                }`}
              >
                <ImageWithFallback src={pickImageUrl(img, 'thumb')} alt="" className="w-full h-full object-cover" iconClassName="w-5 h-5" />
              </button>
            ))
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-surface overflow-hidden">
              <ImageWithFallback iconClassName="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="relative aspect-square bg-surface rounded-2xl overflow-hidden">
            {mainSrc ? (
              <ImageWithFallback src={mainSrc} alt={name} className="w-full h-full object-cover" iconClassName="w-16 h-16" />
            ) : (
              <ImageWithFallback iconClassName="w-16 h-16" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductGallery;
