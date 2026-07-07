import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';
import { useQueryParams } from '../lib/hooks/useQueryParams';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { pickImageUrl } from '../lib/utils/imageUrl';
import { toast } from '../lib/utils/toast';
import Breadcrumb from '../components/Breadcrumb';
import ProductGallery from '../components/ProductGallery';
import ProductInfo from '../components/ProductInfo';
import CompleteStyleSection from '../components/CompleteStyleSection';
import type { Product, ImageVariant } from '../types';

function normalizeImages(images: ImageVariant[] = []): ImageVariant[] {
  return images
    .map((img) => {
      const url = img.url || img.image_url || '';
      const image_large_url = img.image_large_url || img.urls?.large || url;
      const image_medium_url = img.image_medium_url || img.urls?.medium || url;
      const image_thumb_url = img.image_thumb_url || img.urls?.thumb || url;
      return { ...img, url, image_large_url, image_medium_url, image_thumb_url, urls: { large: image_large_url, medium: image_medium_url, thumb: image_thumb_url } };
    })
    .filter((img) => pickImageUrl(img, 'large') || pickImageUrl(img, 'thumb'));
}

function normalizeProduct(p: Product): Product {
  const images = normalizeImages(p.images || []);
  if (!images.length && p.main_image) images.push({ url: p.main_image, is_main: true });
  return { ...p, images };
}

function buildRefCode(p: Product): string {
  const slug = (p.slug || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  if (slug) return `${slug}-${String(p.id).padStart(4, '0')}`;
  return `CG-${String(p.id).padStart(4, '0')}`;
}

function buildDetailBullets(p: Product, detailItems: string[]): string[] {
  const bullets: string[] = [];
  (p.attributes || []).forEach((attr) => {
    const val = attr.custom_value || attr.value_value;
    if (val) bullets.push(`${attr.type_name}: ${val}`);
  });
  bullets.push(...detailItems);
  return bullets;
}

export function ProductPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.product;
  const shopT = cfg.texts.shop;
  const { add } = useCart();
  const navigate = useNavigate();
  const params = useQueryParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageTitle(product?.name || cfg.name);

  useEffect(() => {
    if (!id) {
      navigate('/shop');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const raw = await api.products.get(id);
        if (cancelled) return;
        const p = normalizeProduct(raw);
        setProduct(p);
        if (p.category_id) {
          try {
            const data = await api.products.list({ category_id: p.category_id, limit: 5 });
            if (cancelled) return;
            setRelated((data.data || []).filter((r) => r.id !== p.id).slice(0, 4).map(normalizeProduct));
          } catch {
            /* noop */
          }
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, cfg.name]);

  if (loading) {
    return (
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="text-center py-32 text-muted">
          <p className="text-4xl animate-pulse mb-4">✦</p>
          <p>{t.loading}</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <p className="text-body text-xl text-center">{error || 'محصول یافت نشد.'}</p>
      </main>
    );
  }

  const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
  const displayPrice = defaultVariant
    ? Number(defaultVariant.sale_price || defaultVariant.price || product.price)
    : Number(product.price);
  const displayStock = defaultVariant
    ? Number(defaultVariant.inventory?.quantity ?? 0)
    : Number(product.stock ?? 0);

  const onAddToCart = async (variant: { id?: number } | null, qty: number) => {
    if ((product.variant_axes?.length || 0) > 0 && !variant?.id) {
      toast(t.selectVariant, 'error');
      return;
    }
    try {
      await add(product.id, qty, variant?.id || null);
      toast(t.addedToCart, 'success', 2000);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const onQuickBuy = async (variant: { id?: number } | null, qty: number) => {
    if ((product.variant_axes?.length || 0) > 0 && !variant?.id) {
      toast(t.selectVariant, 'error');
      return;
    }
    try {
      await add(product.id, qty, variant?.id || null);
      navigate('/checkout');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="mb-8 flex justify-end">
        <Breadcrumb
          items={[
            { to: '/', label: shopT.breadcrumbHome },
            { to: '/shop', label: shopT.breadcrumbShop },
            { label: product.name },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-4">
        <ProductGallery images={product.images} name={product.name} refCode={buildRefCode(product)} />
        <ProductInfo
          product={product}
          basePrice={displayPrice}
          baseStock={displayStock}
          detailBullets={buildDetailBullets(product, t.detailItems)}
          onAddToCart={onAddToCart}
          onQuickBuy={onQuickBuy}
        />
      </div>

      <CompleteStyleSection products={related} viewAllTo={product.category_slug ? `/shop?category=${product.category_slug}` : '/shop'} />
    </main>
  );
}

export default ProductPage;
