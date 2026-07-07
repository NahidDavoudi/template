import { cfg } from '../../config/bootstrap';

interface GuestEntry {
  product_id: number;
  variant_id: number | null;
  qty: number;
}

function storageKey(): string {
  return cfg().storage.guestCart || 'nad_guest_cart';
}

function readRaw(): GuestEntry[] {
  try {
    const raw = localStorage.getItem(storageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(items: GuestEntry[]): void {
  localStorage.setItem(storageKey(), JSON.stringify(items));
}

export function itemKey(item: { product_id: number; variant_id: number | null }): string {
  return item.variant_id ? `v:${item.variant_id}` : `p:${item.product_id}`;
}

export function getItems(): GuestEntry[] {
  return readRaw()
    .map((item) => ({
      product_id: Number(item.product_id),
      variant_id: item.variant_id ? Number(item.variant_id) : null,
      qty: Math.max(1, Number(item.qty) || 1),
    }))
    .filter((item) => item.product_id > 0);
}

export function setItems(items: GuestEntry[]): void {
  writeRaw(items);
}

export function addItem(productId: number, qty = 1, variantId: number | null = null): GuestEntry[] {
  const id = Number(productId);
  const vid = variantId ? Number(variantId) : null;
  const amount = Math.max(1, Number(qty) || 1);
  const items = getItems();
  const existing = items.find((i) =>
    vid ? i.variant_id === vid : i.product_id === id && !i.variant_id,
  );
  if (existing) {
    existing.qty += amount;
  } else {
    items.push({ product_id: id, variant_id: vid, qty: amount });
  }
  writeRaw(items);
  return items;
}

export function updateItem(productId: number, qty: number, variantId: number | null = null): GuestEntry[] {
  const id = Number(productId);
  const vid = variantId ? Number(variantId) : null;
  const amount = Number(qty);
  if (amount <= 0) return removeItem(id, vid);
  const items = getItems();
  const existing = items.find((i) =>
    vid ? i.variant_id === vid : i.product_id === id && !i.variant_id,
  );
  if (existing) {
    existing.qty = amount;
  } else {
    items.push({ product_id: id, variant_id: vid, qty: amount });
  }
  writeRaw(items);
  return items;
}

export function removeItem(productId: number, variantId: number | null = null): GuestEntry[] {
  const id = Number(productId);
  const vid = variantId ? Number(variantId) : null;
  const items = getItems().filter((i) => {
    if (vid) return i.variant_id !== vid;
    return !(i.product_id === id && !i.variant_id);
  });
  writeRaw(items);
  return items;
}

export function clear(): void {
  localStorage.removeItem(storageKey());
}

export function totalQty(items: GuestEntry[] = getItems()): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
