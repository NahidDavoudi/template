import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { useQueryParams } from '../lib/hooks/useQueryParams';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { formatPrice } from '../lib/utils/priceFormatter';
import Button from '../components/Button';
import ShopProductCard from '../components/ShopProductCard';
import type { Product } from '../types';

function parseColors(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(',').filter(Boolean);
}

function applyClientFilters(products: Product[], params: Record<string, string>, range: { min: number; max: number }): Product[] {
  const min = params.price_min ? +params.price_min : range.min;
  const max = params.price_max ? +params.price_max : range.max;
  const colors = parseColors(params.color);

  return products.filter((p) => {
    const price = +p.price || 0;
    if (price < min || price > max) return false;
    if (colors.length) {
      const attrText = (p.attributes || [])
        .map((a) => (a.custom_value || a.value_value || '').toLowerCase())
        .join(' ');
      const name = (p.name || '').toLowerCase();
      const haystack = `${attrText} ${name}`;
      const match = colors.some((c) => {
        if (c === 'black') return haystack.includes('مشک') || haystack.includes('black');
        if (c === 'white') return haystack.includes('سفید') || haystack.includes('white');
        if (c === 'grey') return haystack.includes('خاکست') || haystack.includes('grey');
        return false;
      });
      if (!match) return false;
    }
    return true;
  });
}

function normalizeProduct(p: Product): Product {
  if (p.main_image && !p.images?.length) return { ...p, images: [{ url: p.main_image, is_main: true }] };
  if (p.images?.length && !p.images[0].url) return { ...p, images: p.images.map((i) => ({ ...i, url: i.image_url || i.url || '' })) };
  return p;
}

export function ShopPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.shop;
  const range = t.priceRange;
  const navigate = useNavigate();
  const params = useQueryParams();
  usePageTitle(`فروشگاه | ${cfg.name}`);

  const [categoryName, setCategoryName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(t.pageSize);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedSize, setSelectedSize] = useState(params.size || '');
  const [selectedColors, setSelectedColors] = useState<string[]>(parseColors(params.color));
  const [priceMin, setPriceMin] = useState(params.price_min ? +params.price_min : range.min);
  const [priceMax, setPriceMax] = useState(params.price_max ? +params.price_max : range.max);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        if (params.category) {
          try {
            const cat = await api.categories.bySlug(params.category);
            if (!cancelled) setCategoryName(cat?.name || params.category);
          } catch {
            if (!cancelled) setCategoryName(params.category);
          }
        } else {
          setCategoryName('');
        }

        const apiFilters: Record<string, unknown> = { limit: 100 };
        if (params.category) apiFilters.category = params.category;
        if (params.sort) apiFilters.sort = params.sort;
        if (params.q) apiFilters.q = params.q;
        if (params.featured) apiFilters.featured = params.featured;

        const data = await api.products.list(apiFilters);
        if (cancelled) return;
        const all = (data.data || []).map(normalizeProduct);
        setProducts(applyClientFilters(all, params, range));
        setVisibleCount(t.pageSize);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.category, params.sort, params.q, params.featured, params.color, params.price_min, params.price_max, range, t.pageSize]);

  useEffect(() => {
    setSelectedSize(params.size || '');
    setSelectedColors(parseColors(params.color));
    setPriceMin(params.price_min ? +params.price_min : range.min);
    setPriceMax(params.price_max ? +params.price_max : range.max);
  }, [params.size, params.color, params.price_min, params.price_max, range.min, range.max]);

  const title = categoryName || params.era || (params.q ? params.q : t.allProducts);
  const visible = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);
  const hasMore = visibleCount < products.length;

  const buildUrl = (extra: Record<string, string | undefined>) => {
    const next: Record<string, string> = {};
    const keep = { ...params, ...extra };
    Object.keys(keep).forEach((k) => {
      const v = keep[k];
      if (v !== '' && v != null && k !== 'page') next[k] = String(v);
    });
    const qs = new URLSearchParams(next).toString();
    return qs ? `/shop?${qs}` : '/shop';
  };

  const applyFilters = () => {
    navigate(
      buildUrl({
        size: selectedSize,
        color: selectedColors.join(',') || '',
        price_min: priceMin > range.min ? String(priceMin) : '',
        price_max: priceMax < range.max ? String(priceMax) : '',
      }),
    );
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const clearFilters = () => {
    navigate(buildUrl({ era: '', category: '', q: '', size: '', color: '', price_min: '', price_max: '' }));
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const hasActiveFilters = !!(params.era || params.category || params.q || params.size || params.color || (params.price_min && +params.price_min > range.min) || (params.price_max && +params.price_max < range.max));

  const toggleColor = (id: string) => {
    setSelectedColors((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  return (
    <div>
      <section className="bg-surface py-10 md:py-14 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-body">{title}</h1>
      </section>

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <p className="text-sm text-muted">{products.length.toLocaleString('fa-IR')} {t.productsFound}</p>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Link to="/" className="hover:text-body transition-colors">{t.breadcrumbHome}</Link>
            <span className="text-black/20">/</span>
            <Link to="/shop" className="hover:text-body transition-colors">{t.breadcrumbShop}</Link>
            {categoryName && (
              <>
                <span className="text-black/20">/</span>
                <span className="text-body">{categoryName}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-5 md:hidden">
          <button onClick={() => setSidebarOpen(true)} type="button" className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-body hover:border-accent/40 transition-all">
            <span>{t.filterToggle}</span>
          </button>
        </div>

        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="flex items-start gap-8 lg:gap-14 relative">
          <aside
            className={`shrink-0 w-full md:w-56 lg:w-64 ${sidebarOpen ? 'fixed inset-0 z-50 md:static md:inset-auto bg-body p-6 md:p-0 overflow-y-auto' : 'hidden md:block'}`}
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-lg font-bold text-body">{t.filtersTitle}</h2>
              <button onClick={() => setSidebarOpen(false)} type="button" className="md:hidden text-muted hover:text-body p-1" aria-label="بستن">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-body mb-3">{t.sizeLabel}</h3>
              <div className="flex flex-wrap gap-2 justify-end">
                {t.sizes.map((s) => {
                  const active = selectedSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize((prev) => (prev === s ? '' : s))}
                      className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${active ? 'bg-accent text-white border-accent' : 'bg-card text-body border-border hover:border-accent/40'}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-body mb-3">{t.colorLabel}</h3>
              <div className="space-y-3">
                {t.colors.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 flex-row-reverse cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(c.id)}
                      onChange={() => toggleColor(c.id)}
                      className="w-4 h-4 rounded border-border text-accent focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm text-body/80 group-hover:text-body transition-colors">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-body mb-4">{t.priceLabel}</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Math.min(+e.target.value, priceMax))}
                  className="w-full accent-body"
                />
                <input
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Math.max(+e.target.value, priceMin))}
                  className="w-full accent-body"
                />
                <div className="flex items-center justify-between gap-2 text-xs text-muted" dir="ltr">
                  <span>{formatPrice(priceMin, '')}</span>
                  <span>—</span>
                  <span>{formatPrice(priceMax, '')}</span>
                </div>
              </div>
            </div>

            <Button variant="aluminum" className="w-full" onClick={applyFilters}>{t.applyFilters}</Button>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="w-full mt-3 text-sm text-muted hover:text-body transition-colors text-center">
                {t.clearFilters}
              </button>
            )}
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-24 text-muted">
                <p className="text-4xl mb-4 animate-pulse">✦</p>
                <p>{t.loading}</p>
              </div>
            ) : error ? (
              <div className="text-center py-24 text-body">{error}</div>
            ) : !products.length ? (
              <div className="text-center py-24 text-muted">
                <p className="text-4xl mb-4">✦</p>
                <p>{t.empty}</p>
                <Link to="/shop" className="text-body hover:underline mt-3 inline-block text-sm">{t.emptyAction}</Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:gap-x-8 md:gap-y-12">
                  {visible.map((p) => (
                    <ShopProductCard key={p.id} product={p} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-12 md:mt-16">
                    <Button variant="glass" className="mx-auto min-w-[180px]" onClick={() => setVisibleCount((c) => Math.min(c + t.pageSize, products.length))}>
                      {t.showMore}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ShopPage;
