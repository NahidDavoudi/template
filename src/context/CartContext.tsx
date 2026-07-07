import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import api from '../core/api';
import events from '../core/events';
import { useAuth } from './AuthContext';
import type { Cart } from '../types';

interface CartContextValue {
  cart: Cart;
  count: number;
  loading: boolean;
  reload: () => Promise<void>;
  add: (productId: number, qty?: number, variantId?: number | null) => Promise<void>;
  update: (productId: number, qty: number, variantId?: number | null) => Promise<void>;
  remove: (productId: number, variantId?: number | null) => Promise<void>;
  clear: () => Promise<void>;
  applyDiscount: (code: string) => Promise<unknown>;
}

const EMPTY_CART: Cart = { items: [], total: 0 };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.cart.get();
      setCart(data);
      const count = data.items.reduce((s, i) => s + i.qty, 0);
      events.emit('cart:updated', { count });
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload, isLoggedIn]);

  useEffect(() => {
    const off = events.on('cart:request-reload', () => {
      reload();
    });
    return off;
  }, [reload]);

  const add = useCallback(async (productId: number, qty = 1, variantId: number | null = null) => {
    const data = await api.cart.add(productId, qty, variantId);
    setCart(data);
    events.emit('cart:updated', { count: data.items.reduce((s, i) => s + i.qty, 0) });
  }, []);

  const update = useCallback(async (productId: number, qty: number, variantId: number | null = null) => {
    const data = await api.cart.update(productId, qty, variantId);
    setCart(data);
    events.emit('cart:updated', { count: data.items.reduce((s, i) => s + i.qty, 0) });
  }, []);

  const remove = useCallback(async (productId: number, variantId: number | null = null) => {
    const data = await api.cart.remove(productId, variantId);
    setCart(data);
    events.emit('cart:updated', { count: data.items.reduce((s, i) => s + i.qty, 0) });
  }, []);

  const clear = useCallback(async () => {
    const data = await api.cart.clear();
    setCart(data);
    events.emit('cart:updated', { count: 0 });
  }, []);

  const applyDiscount = useCallback((code: string) => api.cart.applyDiscount(code), []);

  const count = cart.items.reduce((s, i) => s + i.qty, 0);

  const value = useMemo<CartContextValue>(
    () => ({ cart, count, loading, reload, add, update, remove, clear, applyDiscount }),
    [cart, count, loading, reload, add, update, remove, clear, applyDiscount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
