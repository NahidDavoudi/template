import auth from './auth';
import * as guestCart from '../lib/utils/guestCart';
import type { Cart, CartItem, Product } from '../types';

export function normalizeCartItem(item: Partial<CartItem> & Record<string, unknown>): CartItem {
  const productId = Number(item.product_id ?? item.id);
  const variantId = item.variant_id ? Number(item.variant_id) : null;
  const qty = Math.max(1, Number(item.qty ?? item.quantity) || 1);
  const price = Number(item.price) || 0;
  return {
    id: variantId || productId,
    product_id: productId,
    variant_id: variantId,
    qty,
    quantity: qty,
    name: (item.name as string) || '',
    price,
    image: (item.image as string) || (item.main_image as string) || '',
    stock: item.stock != null ? Number(item.stock) : null,
    is_active: Number(item.is_active) !== 0 && item.is_active !== false,
    subtotal: price * qty,
    variant_title: (item.variant_title as string) || '',
    sku: (item.sku as string) || '',
  };
}

function normalizeCart(data: Partial<Cart> | null | undefined): Cart {
  const items = (data?.items || []).map((i) => normalizeCartItem(i as unknown as Record<string, unknown>));
  const total = data?.total ?? items.reduce((sum, i) => sum + i.subtotal, 0);
  return { ...(data as object), items, total } as Cart;
}

interface GuestEntry {
  product_id: number;
  variant_id: number | null;
  qty: number;
}

async function enrichGuestItems(
  rawItems: GuestEntry[],
  fetchProduct: (id: number) => Promise<Product | null>,
): Promise<Cart> {
  const results = await Promise.all(
    rawItems.map(async (entry) => {
      try {
        const product = await fetchProduct(entry.product_id);
        if (!product || product.is_active === 0 || product.is_active === false) return null;

        let variant = entry.variant_id && product.variants?.length
          ? product.variants.find((v) => Number(v.id) === Number(entry.variant_id)) || null
          : null;
        if (!variant && product.variants?.length) {
          variant = product.variants.find((v) => v.is_default) || product.variants[0] || null;
        }

        const stock = variant ? Number(variant.inventory?.quantity ?? 0) : Number(product.stock) || 0;
        const price = variant ? Number(variant.sale_price || variant.price || product.price) : Number(product.price);
        const qty = Math.min(entry.qty, Math.max(1, stock || entry.qty));
        const name = variant && variant.title && variant.title !== 'Default'
          ? `${product.name} — ${variant.title}`
          : product.name;

        return normalizeCartItem({
          product_id: entry.product_id,
          variant_id: variant?.id || entry.variant_id || null,
          qty,
          name,
          price,
          image: product.main_image || product.images?.[0]?.image_url || '',
          stock,
          is_active: !!product.is_active,
          variant_title: variant?.title || '',
          sku: variant?.sku || '',
        });
      } catch {
        return null;
      }
    }),
  );

  const items = results.filter(Boolean) as CartItem[];
  const staleKeys = new Set(
    rawItems
      .filter((entry) => !items.some((i) =>
        entry.variant_id
          ? i.variant_id === entry.variant_id
          : i.product_id === entry.product_id && !i.variant_id,
      ))
      .map((entry) => guestCart.itemKey(entry)),
  );

  if (staleKeys.size) {
    guestCart.setItems(rawItems.filter((entry) => !staleKeys.has(guestCart.itemKey(entry))));
  }

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  return { items, total };
}

export interface CartHttp {
  get: (path: string) => Promise<unknown>;
  post: (path: string, body: BodyInit | Record<string, unknown>) => Promise<unknown>;
  patch: (path: string, body: BodyInit | Record<string, unknown>) => Promise<unknown>;
  del: (path: string) => Promise<unknown>;
  withFallback: <T>(p: Promise<T>, fb: T) => Promise<T>;
  fetchProduct: (id: number) => Promise<Product | null>;
}

export function createCartStore(http: CartHttp) {
  const { get, post, patch, del, withFallback, fetchProduct } = http;

  async function getGuestCart(): Promise<Cart> {
    const raw = guestCart.getItems();
    if (!raw.length) return { items: [], total: 0 };
    return enrichGuestItems(raw, fetchProduct);
  }

  async function mergeGuestIfNeeded(): Promise<Cart | null> {
    if (!auth.isLoggedIn()) return null;
    const raw = guestCart.getItems();
    if (!raw.length) return null;
    const merged = await post('/cart/merge', { items: raw });
    guestCart.clear();
    return normalizeCart(merged as Cart);
  }

  return {
    mergeGuestIfNeeded,

    get: async (): Promise<Cart> => {
      if (auth.isLoggedIn()) {
        const data = await withFallback(get('/cart'), { items: [], total: 0 } as Cart);
        return normalizeCart(data as Cart);
      }
      return getGuestCart();
    },

    add: async (productId: number, qty = 1, variantId: number | null = null): Promise<Cart> => {
      if (auth.isLoggedIn()) {
        const body: Record<string, unknown> = { product_id: productId, qty };
        if (variantId) body.variant_id = variantId;
        const data = await post('/cart/items', body);
        return normalizeCart(data as Cart);
      }
      const product = await fetchProduct(productId);
      if (!product || product.is_active === 0 || product.is_active === false) {
        throw new Error('محصول یافت نشد.');
      }
      let variant = variantId && product.variants?.length
        ? product.variants.find((v) => Number(v.id) === Number(variantId)) || null
        : null;
      if (!variant && product.variants?.length) {
        variant = product.variants.find((v) => v.is_default) || product.variants[0] || null;
      }
      const resolvedVariantId = variant?.id || variantId || null;
      const items = guestCart.getItems();
      const current = items.find((i) =>
        resolvedVariantId
          ? i.variant_id === Number(resolvedVariantId)
          : i.product_id === Number(productId) && !i.variant_id,
      );
      const nextQty = (current?.qty || 0) + Math.max(1, Number(qty) || 1);
      const stock = variant ? Number(variant.inventory?.quantity ?? 0) : Number(product.stock) || 0;
      if (stock < nextQty) {
        throw new Error(`موجودی کافی نیست. فقط ${stock.toLocaleString('fa-IR')} عدد در انبار موجود است.`);
      }
      guestCart.addItem(productId, qty, resolvedVariantId);
      return getGuestCart();
    },

    update: async (productId: number, qty: number, variantId: number | null = null): Promise<Cart> => {
      if (auth.isLoggedIn()) {
        const path = variantId ? `/cart/items/variant/${variantId}` : `/cart/items/${productId}`;
        const data = await patch(path, { qty, product_id: productId, variant_id: variantId });
        return normalizeCart(data as Cart);
      }
      const amount = Number(qty);
      if (amount <= 0) {
        guestCart.removeItem(productId, variantId);
        return getGuestCart();
      }
      const product = await fetchProduct(productId);
      if (!product || product.is_active === 0 || product.is_active === false) {
        guestCart.removeItem(productId, variantId);
        throw new Error('محصول یافت نشد.');
      }
      const variant = variantId && product.variants?.length
        ? product.variants.find((v) => Number(v.id) === Number(variantId)) || null
        : null;
      const stock = variant ? Number(variant.inventory?.quantity ?? 0) : Number(product.stock) || 0;
      if (amount > stock) {
        throw new Error(`موجودی کافی نیست. فقط ${stock.toLocaleString('fa-IR')} عدد در انبار موجود است.`);
      }
      guestCart.updateItem(productId, amount, variantId);
      return getGuestCart();
    },

    remove: async (productId: number, variantId: number | null = null): Promise<Cart> => {
      if (auth.isLoggedIn()) {
        const path = variantId ? `/cart/items/variant/${variantId}` : `/cart/items/${productId}`;
        const data = await del(path);
        return normalizeCart(data as Cart);
      }
      guestCart.removeItem(productId, variantId);
      return getGuestCart();
    },

    clear: async (): Promise<Cart> => {
      if (auth.isLoggedIn()) {
        await del('/cart');
        return { items: [], total: 0 };
      }
      guestCart.clear();
      return { items: [], total: 0 };
    },

    applyDiscount: (code: string) => post('/cart/discount', { code }),
  };
}

export default createCartStore;
