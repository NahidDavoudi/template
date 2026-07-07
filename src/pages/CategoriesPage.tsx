import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { pickCategoryImage } from '../lib/utils/imageUrl';
import ImageWithFallback from '../components/ImageWithFallback';
import type { Category } from '../types';

export function CategoriesPage() {
  const cfg = useStoreConfig();
  usePageTitle(`دسته‌بندی‌ها | ${cfg.name}`);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.categories.list();
        if (!cancelled) setCategories(data);
      } catch {
        /* noop */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
      <div className="text-right mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">دسته‌بندی‌ها</h1>
        <p className="text-muted">دسته‌بندی محصولات {cfg.name}</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-span-full text-center py-16 text-muted animate-pulse">✦ در حال بارگذاری...</div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className="group block iris-card rounded-2xl overflow-hidden bg-card border border-border"
            >
              <div className="relative aspect-square overflow-hidden bg-surface">
                <ImageWithFallback
                  src={pickCategoryImage(c, 'medium')}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-bold text-lg">{c.name}</h3>
                    {c.product_count != null && <p className="text-xs text-white/70">{c.product_count} محصول</p>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default CategoriesPage;
