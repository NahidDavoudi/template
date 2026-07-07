import { cfg } from '../config/bootstrap';
import { demoData } from '../config/demoData';
import type { Product, Category, ProductListFilters, Order, OrderItemInput } from '../types';

export function isDemoMode(): boolean {
  return !!cfg().demoMode;
}

export function demoProductList(filters: ProductListFilters = {}): { data: Product[] } {
  let items = [...demoData.products];

  if (filters.featured) items = items.filter((p) => p.is_featured);
  if (filters.category) items = items.filter((p) => p.category_slug === filters.category);
  if (filters.category_id) items = items.filter((p) => p.category_id === Number(filters.category_id));
  if (filters.q) {
    const q = String(filters.q).trim();
    items = items.filter((p) => p.name.includes(q));
  }
  if (filters.sort === 'price_asc') items.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price_desc') items.sort((a, b) => b.price - a.price);
  if (filters.limit) items = items.slice(0, Number(filters.limit));

  return { data: items };
}

export function demoProductGet(id: number | string): Product | null {
  const product = demoData.products.find((p) => String(p.id) === String(id));
  if (!product) return null;
  return JSON.parse(JSON.stringify(product)) as Product;
}

export function demoCategoriesList(): Category[] {
  return demoData.categories.map((c) => ({ ...c }));
}

export function demoCategoryBySlug(slug: string): Category | null {
  return demoData.categories.find((c) => c.slug === slug) || null;
}

export function demoOrderCreate(data: { items?: OrderItemInput[]; payment_method?: string } | undefined): Order {
  const items = data?.items || [];
  let total = 0;
  items.forEach((item) => {
    const product = demoData.products.find((p) => p.id === Number(item.product_id));
    if (product) total += product.price * (item.qty || 1);
  });
  const shipping = total >= 1500000 ? 0 : 50000;
  total += shipping;
  return {
    id: Date.now(),
    order_number: `ND-${Date.now().toString().slice(-6)}`,
    total,
    status: 'pending_payment',
    payment_method: data?.payment_method || 'card_to_card',
  };
}
