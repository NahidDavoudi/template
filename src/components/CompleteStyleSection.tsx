import { Link } from 'react-router-dom';
import { useStoreConfig } from '../context/ConfigContext';
import ShopProductCard from './ShopProductCard';
import type { Product } from '../types';

interface CompleteStyleSectionProps {
  products: Product[];
  viewAllTo: string;
}

export function CompleteStyleSection({ products, viewAllTo }: CompleteStyleSectionProps) {
  const cfg = useStoreConfig();
  const t = cfg.texts.product;
  if (!products.length) return null;

  return (
    <section className="mt-16 md:mt-24 border-t border-border pt-12 md:pt-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-body">{t.completeStyle}</h2>
          <Link to={viewAllTo} className="text-sm text-muted hover:text-accent transition-colors">{t.viewAll}</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 md:gap-x-8 md:gap-y-12">
          {products.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompleteStyleSection;
