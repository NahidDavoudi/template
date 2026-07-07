import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { formatPrice } from '../lib/utils/priceFormatter';
import { toast } from '../lib/utils/toast';
import ImageWithFallback from '../components/ImageWithFallback';
import type { Cart, Discount } from '../types';

export function CartPage() {
  const cfg = useStoreConfig();
  const { cart, update, remove, loading } = useCart();
  usePageTitle(`سبد خرید | ${cfg.name}`);

  const [discount, setDiscount] = useState<Discount | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountMsg, setDiscountMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [localCart, setLocalCart] = useState<Cart>(cart);

  useEffect(() => {
    setLocalCart(cart);
    setDiscount(null);
    setDiscountMsg(null);
  }, [cart]);

  const shipping = (total: number) => (total >= cfg.shipping.freeFrom ? 0 : cfg.shipping.standardCost);
  const discAmt = discount
    ? discount.type === 'percent'
      ? Math.round((localCart.total * discount.value) / 100)
      : discount.value
    : 0;
  const realTotal = localCart.total + shipping(localCart.total) - discAmt;

  const onUpdate = async (productId: number, qty: number, variantId: number | null) => {
    try {
      await update(productId, qty, variantId);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const onRemove = async (productId: number, variantId: number | null) => {
    try {
      await remove(productId, variantId);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const res = await api.discounts.validate(discountCode.trim(), localCart.total);
      const d = (res as { discount?: Discount })?.discount || (res as Discount);
      setDiscount(d);
      setDiscountMsg({ text: '✓ کد تخفیف اعمال شد', ok: true });
    } catch {
      setDiscount(null);
      setDiscountMsg({ text: '✕ کد تخفیف نامعتبر است', ok: false });
    }
  };

  if (loading) {
    return (
      <main className="bg-card max-w-[1200px] mx-auto px-4 md:px-10 py-12 rounded-2xl">
        <h1 className="text-3xl font-bold text-right mb-10">سبد خرید</h1>
        <div className="text-center py-32 text-muted"><p className="text-4xl animate-pulse mb-4">✦</p><p>در حال بارگذاری...</p></div>
      </main>
    );
  }

  if (!localCart.items?.length) {
    return (
      <main className="bg-card max-w-[1200px] mx-auto px-4 md:px-10 py-12 rounded-2xl">
        <h1 className="text-3xl font-bold text-right mb-10">سبد خرید</h1>
        <div className="text-center py-32 text-muted">
          <p className="text-xl mb-4">سبد خرید شما خالی است</p>
          <Link to="/shop" className="inline-block px-8 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover">ادامه خرید</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-card max-w-[1200px] mx-auto px-4 md:px-10 py-12 rounded-2xl">
      <h1 className="text-3xl font-bold text-right mb-10">سبد خرید</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
        <div className="md:col-span-2 space-y-4">
          {localCart.items.map((item) => (
            <div key={`${item.product_id}-${item.variant_id}`} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center">
              <Link to={`/product?id=${item.product_id}`} className="w-20 h-20 rounded-lg shrink-0 overflow-hidden bg-surface relative block">
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" iconClassName="w-8 h-8" />
              </Link>
              <div className="flex-1 text-right min-w-0">
                <h3 className="font-medium mb-1 truncate">
                  <Link to={`/product?id=${item.product_id}`} className="hover:text-accent">{item.name}</Link>
                </h3>
                <p className="text-accent font-bold mt-1">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onRemove(item.product_id, item.variant_id)}
                  className="w-8 h-8 rounded border border-border text-muted hover:border-red-500 hover:text-red-500 transition-colors text-sm"
                  aria-label="حذف"
                >
                  ✕
                </button>
                <input
                  type="number"
                  value={item.qty}
                  min={1}
                  max={10}
                  onChange={(e) => onUpdate(item.product_id, parseInt(e.target.value, 10) || 1, item.variant_id)}
                  className="w-14 bg-body border border-border rounded px-2 py-1 text-center text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold text-right mb-6">خلاصه سفارش</h2>
          <div className="space-y-3 mb-4 text-right">
            <div className="flex justify-between text-muted text-sm"><span>{formatPrice(localCart.total)}</span><span>جمع کالاها</span></div>
            {discAmt > 0 && <div className="flex justify-between text-green-600 text-sm"><span>-{formatPrice(discAmt)}</span><span>تخفیف</span></div>}
            <div className="flex justify-between text-muted text-sm"><span>{shipping(localCart.total) === 0 ? 'رایگان' : formatPrice(shipping(localCart.total))}</span><span>ارسال</span></div>
          </div>
          <div className="border-t border-border pt-4 mb-4">
            <p className="text-sm text-accent mb-2 text-right">کد تخفیف</p>
            <div className="flex gap-2" dir="ltr">
              <button onClick={applyDiscount} className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:border-accent transition-colors">اعمال</button>
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="کد تخفیف..."
                dir="rtl"
                className="flex-1 bg-body border border-border rounded-lg px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent"
              />
            </div>
            {discountMsg && (
              <p className={`text-xs mt-2 text-right ${discountMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{discountMsg.text}</p>
            )}
          </div>
          <div className="border-t border-border pt-4 mb-6">
            <div className="flex justify-between font-bold text-lg"><span>{formatPrice(realTotal)}</span><span>مجموع</span></div>
          </div>
          <Link to="/checkout" className="block w-full py-4 bg-accent text-white text-center rounded-xl font-bold hover:bg-accent-hover shadow">ادامه به پرداخت</Link>
          <Link to="/shop" className="block text-center text-muted text-sm mt-4 hover:text-accent">← ادامه خرید</Link>
        </div>
      </div>
    </main>
  );
}

export default CartPage;
