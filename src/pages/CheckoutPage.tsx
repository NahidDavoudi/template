import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { formatPrice } from '../lib/utils/priceFormatter';
import { loadIranLocations, type IranLocations } from '../lib/utils/iranLocations';
import { toast } from '../lib/utils/toast';
import ImageWithFallback from '../components/ImageWithFallback';
import type { Address, Discount } from '../types';

export function CheckoutPage() {
  const cfg = useStoreConfig();
  const { user, isLoggedIn } = useAuth();
  const { cart, clear, loading } = useCart();
  const navigate = useNavigate();
  usePageTitle(`تسویه حساب | ${cfg.name}`);

  const [locations, setLocations] = useState<IranLocations | null>(null);
  const [provinceId, setProvinceId] = useState('');
  const [city, setCity] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [saveAddress, setSaveAddress] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIranLocations(cfg.data.iranLocations).then(setLocations).catch(() => setLocations(null));
  }, [cfg.data.iranLocations]);

  useEffect(() => {
    if (!isLoggedIn) {
      setSavedAddresses([]);
      return;
    }
    api.users.getAddresses().then((data) => {
      const arr = Array.isArray(data) ? data : ((data as { data?: Address[] })?.data || (data as { addresses?: Address[] })?.addresses || []);
      setSavedAddresses(arr);
      const def = arr.find((a) => Number(a.is_default) === 1);
      setSelectedAddressId(def ? String(def.id) : arr[0] ? String(arr[0].id) : 'new');
    }).catch(() => setSavedAddresses([]));
  }, [isLoggedIn]);

  const cities = useMemo(() => (locations && provinceId ? locations.getCities(provinceId) : []), [locations, provinceId]);
  const provinceName = useMemo(() => locations?.provinces.find((p) => p.id === provinceId)?.name || '', [locations, provinceId]);

  useEffect(() => {
    if (selectedAddressId !== 'new') {
      const addr = savedAddresses.find((a) => String(a.id) === selectedAddressId);
      if (addr) {
        setName(addr.receiver || addr.receiver_name || name);
        setPhone(addr.phone || phone);
        setPostalCode(addr.postal_code || '');
        setAddress(addr.address || '');
        const pid = locations?.provinces.find((p) => p.name === addr.province)?.id || '';
        if (pid) {
          setProvinceId(pid);
          setCity(addr.city || '');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId, savedAddresses, locations]);

  const shipping = (total: number) => (total >= cfg.shipping.freeFrom ? 0 : cfg.shipping.standardCost);
  const discAmt = discount
    ? discount.type === 'percent'
      ? Math.round((cart.total * discount.value) / 100)
      : discount.value
    : 0;
  const finalTotal = cart.total + shipping(cart.total) - discAmt;

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const res = await api.discounts.validate(discountCode.trim(), cart.total);
      setDiscount((res as { discount?: Discount })?.discount || (res as Discount));
    } catch {
      setDiscount(null);
      toast('کد تخفیف نامعتبر است', 'error');
    }
  };

  const submit = async () => {
    if (!name || !phone || !provinceId || !city || !postalCode || !address) {
      setError('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (isLoggedIn && saveAddress && selectedAddressId === 'new' && savedAddresses.length < (cfg.addresses.maxCount || 3)) {
        try {
          await api.users.addAddress({
            title: cfg.texts.checkout.defaultAddressTitle || 'آدرس checkout',
            province: provinceName,
            city,
            address,
            postal_code: postalCode,
            receiver: name,
            phone,
            is_default: savedAddresses.length === 0 ? 1 : 0,
          });
        } catch (e) {
          toast((e as Error).message, 'warning');
        }
      }

      const fullAddress = `${provinceName}، ${city}، ${address} — کد پستی: ${postalCode}`;
      const items = cart.items.map((i) => ({ product_id: i.product_id, qty: i.qty }));
      const result = await api.orders.create({
        customer_name: name,
        customer_phone: phone,
        shipping_address: fullAddress,
        payment_method: 'cash',
        items,
        ...(discount ? { discount_code: discountCode } : {}),
      });
      await clear();
      sessionStorage.setItem('nad_checkout', JSON.stringify({
        ...(result as object),
        customer_name: name,
        customer_phone: phone,
        shipping_address: fullAddress,
      }));
      navigate('/payment');
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-12">
        <div className="text-center py-32 text-muted"><p className="text-4xl animate-pulse">✦</p></div>
      </main>
    );
  }

  if (!cart.items?.length) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-12">
        <div className="text-center py-32 text-muted">
          <p className="text-xl mb-4">سبد خرید شما خالی است</p>
          <Link to="/shop" className="inline-block px-8 py-3 bg-accent text-white rounded-lg">ادامه خرید</Link>
        </div>
      </main>
    );
  }

  const fieldsDisabled = selectedAddressId !== 'new';

  return (
    <main className="bg-card max-w-[1200px] mx-auto px-4 md:px-10 py-12 rounded-2xl">
      <h1 className="text-3xl font-bold text-right mb-10">تسویه حساب</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-6">
          {isLoggedIn && savedAddresses.length > 0 && (
            <div>
              <p className="text-sm font-bold text-body mb-3 text-right">{cfg.texts.checkout.savedAddresses}</p>
              <div className="space-y-2">
                {savedAddresses.map((addr) => (
                  <label
                    key={String(addr.id)}
                    className={`flex items-start gap-3 flex-row-reverse p-3 rounded-xl border cursor-pointer transition-colors ${String(addr.id) === selectedAddressId ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'}`}
                  >
                    <input type="radio" name="saved-address" value={String(addr.id)} checked={String(addr.id) === selectedAddressId} onChange={() => setSelectedAddressId(String(addr.id))} className="mt-1" />
                    <span className="text-right min-w-0 flex-1">
                      <span className="block text-sm font-bold text-body">{addr.title || `${addr.province}، ${addr.city}`}</span>
                      <span className="block text-xs text-muted mt-1 leading-relaxed">{addr.address}{addr.postal_code ? ` — کد پستی: ${addr.postal_code}` : ''}</span>
                    </span>
                  </label>
                ))}
                <label className={`flex items-center gap-3 flex-row-reverse p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === 'new' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'}`}>
                  <input type="radio" name="saved-address" value="new" checked={selectedAddressId === 'new'} onChange={() => setSelectedAddressId('new')} className="shrink-0" />
                  <span className="text-sm font-medium text-body">{cfg.texts.checkout.newAddress}</span>
                </label>
              </div>
            </div>
          )}

          <div id="checkout-address-fields" className={`space-y-4 ${fieldsDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-2 gap-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام و نام‌خانوادگی" className="admin-input rounded-lg px-4 py-3 text-sm w-full" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره موبایل" className="admin-input rounded-lg px-4 py-3 text-sm w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select value={provinceId} onChange={(e) => { setProvinceId(e.target.value); setCity(''); }} disabled={!locations} className="admin-input rounded-lg px-4 py-3 text-sm w-full">
                <option value="">انتخاب استان...</option>
                {locations?.provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!cities.length} className="admin-input rounded-lg px-4 py-3 text-sm w-full">
                <option value="">انتخاب شهر...</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="کد پستی" className="admin-input rounded-lg px-4 py-3 text-sm w-full" />
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس کامل" rows={3} className="admin-input rounded-lg px-4 py-3 text-sm w-full" />
            {isLoggedIn && selectedAddressId === 'new' && savedAddresses.length < (cfg.addresses.maxCount || 3) && (
              <label className="flex items-center gap-3 flex-row-reverse cursor-pointer">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-muted">{cfg.texts.checkout.saveAddress}</span>
              </label>
            )}
          </div>

          {error && <p className="text-sm text-accent text-right">{error}</p>}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-right mb-6">جزئیات سفارش</h2>
          <div className="space-y-3 mb-4">
            {cart.items.map((item) => (
              <div key={`${item.product_id}-${item.variant_id}`} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg shrink-0 overflow-hidden bg-surface relative">
                  <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" iconClassName="w-6 h-6" />
                </div>
                <div className="flex-1 text-right min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted">× {item.qty.toLocaleString('fa-IR')}</p>
                </div>
                <p className="text-sm font-bold shrink-0">{formatPrice(item.subtotal || item.price * item.qty)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-2 mb-4 text-right">
            <div className="flex justify-between text-muted text-sm"><span>{formatPrice(cart.total)}</span><span>جمع کالاها</span></div>
            {discAmt > 0 && <div className="flex justify-between text-green-600 text-sm"><span>-{formatPrice(discAmt)}</span><span>تخفیف</span></div>}
            <div className="flex justify-between text-muted text-sm"><span>{shipping(cart.total) === 0 ? 'رایگان' : formatPrice(shipping(cart.total))}</span><span>ارسال</span></div>
          </div>
          <div className="flex gap-2 mb-4" dir="ltr">
            <button onClick={applyDiscount} className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:border-accent">اعمال</button>
            <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="کد تخفیف" dir="rtl" className="flex-1 bg-body border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div className="border-t border-border pt-4 mb-6">
            <div className="flex justify-between font-bold text-lg"><span>{formatPrice(finalTotal)}</span><span>مجموع</span></div>
          </div>
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover shadow disabled:opacity-50"
          >
            {submitting ? 'در حال ثبت سفارش...' : 'ثبت سفارش'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;
