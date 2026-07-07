import type { ImageSize, ImageVariant, Product, Category, PromoBanner } from '../../types';

export function pickImageUrl(
  source: string | ImageVariant | null | undefined,
  size: ImageSize = 'medium',
): string {
  if (!source) return '';
  if (typeof source === 'string') return source;

  const urls = source.urls || {};
  const variantKey =
    size === 'large' ? 'image_large_url' : size === 'thumb' ? 'image_thumb_url' : 'image_medium_url';

  return (
    urls[size] ||
    (source[variantKey as keyof ImageVariant] as string | undefined) ||
    source.url ||
    source.image_url ||
    source.poster_image ||
    source.main_image ||
    ''
  );
}

export function pickProductImage(product: Product | null | undefined, size: ImageSize = 'medium'): string {
  if (!product) return '';
  const main = product.images?.find((i) => i.is_main) || product.images?.[0];
  if (main) return pickImageUrl(main, size);
  return pickImageUrl(
    {
      image_url: product.main_image || '',
      image_medium_url: product.main_image_medium,
      image_thumb_url: product.main_image_thumb,
    },
    size,
  );
}

export function pickCategoryImage(category: Category | null | undefined, size: ImageSize = 'medium'): string {
  if (!category) return '';
  const poster = category.poster_image
    ? {
        image_url: category.poster_image,
        image_medium_url: category.poster_image_medium,
        image_thumb_url: category.poster_image_thumb,
      }
    : null;
  if (poster?.image_url) return pickImageUrl(poster, size);
  const main = category.images?.find((i) => i.is_main) || category.images?.[0];
  if (main) return pickImageUrl(main, size);
  return pickImageUrl({ image_url: category.main_image || category.image_url || '' }, size);
}

export function pickBannerImage(banner: PromoBanner | null | undefined, size: ImageSize = 'medium'): string {
  return pickImageUrl(banner, size);
}

export function pickVariantSet(
  variants: { large: string; medium: string; thumb: string } | null | undefined,
  size: ImageSize = 'medium',
): string {
  if (!variants || typeof variants !== 'object') return '';
  return variants[size] || variants.medium || variants.large || variants.thumb || '';
}
