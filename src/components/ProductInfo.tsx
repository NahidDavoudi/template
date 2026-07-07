import { useMemo, useState } from 'react';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import { useStoreConfig } from '../context/ConfigContext';
import { formatPrice } from '../lib/utils/priceFormatter';
import { escapeHtml } from '../lib/utils/htmlEscape';
import Button from './Button';
import type { Product, ProductVariant, VariantAxis } from '../types';

interface ProductInfoProps {
  product: Product;
  basePrice: number;
  baseStock: number;
  detailBullets: string[];
  onAddToCart: (variant: ProductVariant | null, qty: number) => Promise<void>;
  onQuickBuy: (variant: ProductVariant | null, qty: number) => Promise<void>;
}

function buildValueMap(variant: ProductVariant): Record<string, number> {
  const map: Record<string, number> = {};
  (variant.attribute_values || []).forEach((av) => {
    map[av.type_slug] = Number(av.id);
  });
  return map;
}

function findMatchingVariant(
  variants: ProductVariant[],
  variantAxes: VariantAxis[],
  selected: Record<string, number | undefined>,
): ProductVariant | null {
  const axisSlugs = variantAxes.map((a) => a.type_slug);
  if (!axisSlugs.length) {
    return variants.find((v) => v.is_default) || variants.find((v) => v.is_active) || variants[0] || null;
  }
  if (!axisSlugs.every((slug) => selected[slug])) return null;
  return (
    variants.find((v) => {
      if (!v.is_active) return false;
      const valueMap = buildValueMap(v);
      return axisSlugs.every((slug) => valueMap[slug] === Number(selected[slug]));
    }) || null
  );
}

function isValueSelectable(
  variants: ProductVariant[],
  variantAxes: VariantAxis[],
  selected: Record<string, number | undefined>,
  axisSlug: string,
  valueId: number,
): boolean {
  const axisSlugs = variantAxes.map((a) => a.type_slug);
  return variants.some((v) => {
    if (!v.is_active || (v.inventory?.quantity ?? 0) <= 0) return false;
    const valueMap = buildValueMap(v);
    if (valueMap[axisSlug] !== Number(valueId)) return false;
    return axisSlugs.every((slug) => {
      if (slug === axisSlug) return true;
      if (selected[slug] == null) return true;
      return valueMap[slug] === Number(selected[slug]);
    });
  });
}

function findInitialSelection(variants: ProductVariant[], variantAxes: VariantAxis[]): Record<string, number | undefined> {
  const selected: Record<string, number | undefined> = {};
  const axisSlugs = variantAxes.map((a) => a.type_slug);
  const firstInStock = variants.find((v) => v.is_active && (v.inventory?.quantity ?? 0) > 0);
  if (firstInStock) {
    const valueMap = buildValueMap(firstInStock);
    axisSlugs.forEach((slug) => {
      if (valueMap[slug]) selected[slug] = valueMap[slug];
    });
  }
  return selected;
}

function getVariantPrice(variant: ProductVariant | null, product: Product): number {
  if (variant?.sale_price) return Number(variant.sale_price);
  if (variant?.price) return Number(variant.price);
  if (product.sale_price) return Number(product.sale_price);
  return Number(product.price) || 0;
}

export function ProductInfo({ product, basePrice, baseStock, detailBullets, onAddToCart, onQuickBuy }: ProductInfoProps) {
  const cfg = useStoreConfig();
  const t = cfg.texts.product;
  const ui = cfg.ui.variant;
  const variantAxes = product.variant_axes || [];
  const variants = product.variants || [];

  const [selected, setSelected] = useState<Record<string, number | undefined>>(() =>
    variantAxes.length ? findInitialSelection(variants, variantAxes) : {},
  );
  const [qty, setQty] = useState(1);
  const [accOpen, setAccOpen] = useState<Record<string, boolean>>({ details: true, shipping: false });

  const variant = useMemo(() => findMatchingVariant(variants, variantAxes, selected), [variants, variantAxes, selected]);
  const axisSlugs = variantAxes.map((a) => a.type_slug);
  const allSelected = !axisSlugs.length || axisSlugs.every((slug) => selected[slug]);
  const stock = variant ? Number(variant.inventory?.quantity ?? 0) : variantAxes.length ? 0 : baseStock;
  const displayPrice = variantAxes.length ? (variant ? getVariantPrice(variant, product) : basePrice) : basePrice;
  const out = variantAxes.length ? !variant || stock <= 0 : baseStock <= 0;
  const maxQty = Math.max(1, stock || 1);

  const effectiveQty = variant && stock > 0 && qty > stock ? stock : qty;

  const selectValue = (axis: string, valueId: number) => {
    setSelected((prev) => ({ ...prev, [axis]: valueId }));
  };

  const hint = variantAxes.length && !allSelected
    ? t.selectOptionsHint || t.selectVariant
    : out
      ? t.outOfStock || 'ناموجود'
      : '';

  return (
    <div className="product-info text-right">
      <h1 className="text-2xl md:text-4xl font-bold text-body leading-tight mb-3">{product.name}</h1>
      <p className="text-lg md:text-xl font-medium text-body mb-6">{formatPrice(displayPrice)}</p>
      {(product.short_description || product.description) && (
        <p className="text-sm md:text-base text-muted leading-relaxed mb-8 max-w-lg">
          {product.short_description || product.description}
        </p>
      )}

      <div id="product-variant-selectors">
        {variantAxes.map((axis) => (
          <div key={axis.type_slug} className="mb-6">
            <p className="text-sm font-medium text-body mb-3">{axis.type_name}</p>
            <div className="flex flex-wrap gap-2 justify-end">
              {axis.values.map((val) => {
                const selectable = isValueSelectable(variants, variantAxes, selected, axis.type_slug, val.id);
                const active = Number(selected[axis.type_slug]) === Number(val.id);
                const isSwatch = axis.input_type === 'swatch';
                const stateClass = !selectable
                  ? ui.swatchDisabled
                  : active
                    ? ui.textActive
                    : ui.textInactive;
                if (isSwatch) {
                  return (
                    <button
                      key={val.id}
                      type="button"
                      disabled={!selectable}
                      onClick={() => selectValue(axis.type_slug, val.id)}
                      title={val.value}
                      className={`product-variant-btn w-9 h-9 rounded-full border-2 transition-all ${
                        !selectable ? ui.swatchDisabled : active ? ui.swatchActive : ui.swatchInactive
                      }`}
                      style={val.swatch_hex ? { background: escapeHtml(val.swatch_hex) } : undefined}
                    />
                  );
                }
                return (
                  <button
                    key={val.id}
                    type="button"
                    disabled={!selectable}
                    onClick={() => selectValue(axis.type_slug, val.id)}
                    className={`product-variant-btn relative min-w-[2.75rem] h-11 px-3 rounded-lg border text-sm font-medium transition-colors ${stateClass} ${
                      !selectable ? 'product-size-unavailable' : ''
                    }`}
                  >
                    {val.value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center border border-black/10 rounded-full overflow-hidden shrink-0" dir="ltr">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-body hover:bg-black/5 transition-colors"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium text-body">{effectiveQty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="w-10 h-10 flex items-center justify-center text-body hover:bg-black/5 transition-colors"
          >
            +
          </button>
        </div>
        <div className="flex-1">
          <Button
            variant="aluminum"
            className="w-full product-add-btn"
            disabled={out}
            icon={<ShoppingBag className="w-4 h-4" />}
            onClick={() => onAddToCart(variant, effectiveQty)}
          >
            {t.addToCart}
          </Button>
        </div>
      </div>

      <p className={`text-xs mb-4 ${hint ? 'text-accent' : 'text-muted'}`}>{hint}</p>

      <button
        type="button"
        disabled={out}
        onClick={() => onQuickBuy(variant, effectiveQty)}
        className={`w-full text-center text-sm text-muted hover:text-body transition-colors mb-8 ${out ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {t.quickBuy}
      </button>

      <div className="border-t border-black/10">
        <button
          type="button"
          onClick={() => setAccOpen((p) => ({ ...p, details: !p.details }))}
          className="w-full flex items-center justify-between py-4 text-body"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${accOpen.details ? 'rotate-180' : ''}`} />
          <span className="font-medium text-sm">{t.detailsTitle}</span>
        </button>
        {accOpen.details && (
          <ul className="pb-5 space-y-2 list-disc list-inside marker:text-muted">
            {detailBullets.map((item, i) => (
              <li key={i} className="text-sm text-muted leading-relaxed">{item}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-black/10">
        <button
          type="button"
          onClick={() => setAccOpen((p) => ({ ...p, shipping: !p.shipping }))}
          className="w-full flex items-center justify-between py-4 text-body"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${accOpen.shipping ? 'rotate-180' : ''}`} />
          <span className="font-medium text-sm">{t.shippingTitle}</span>
        </button>
        {accOpen.shipping && <p className="pb-5 text-sm text-muted leading-relaxed">{t.shippingText}</p>}
      </div>
    </div>
  );
}

export default ProductInfo;
