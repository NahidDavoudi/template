import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { formatPrice, formatDate } from '../lib/utils/priceFormatter';
import type { Order } from '../types';

const PER_PAGE = 8;

function statusLabel(status: string, map: Record<string, { label: string; cls: string }>): { label: string; cls: string } {
  return map[status] || { label: status, cls: 'bg-card text-muted' };
}

export function OrdersPage() {
  const cfg = useStoreConfig();
  const { isLoggedIn } = useAuth();
  usePageTitle(`سفارشات | ${cfg.name}`);
  const statusMap = cfg.texts.admin.orderStatuses;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api.orders.list();
        if (cancelled) return;
        setOrders(Array.isArray(data) ? data : ((data as { data?: Order[] })?.data || (data as { orders?: Order[] })?.orders || []));
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const active = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status || '')).length;
  const totalAmt = orders.reduce((s, o) => s + Number(o.total_amount || o.total || 0), 0);
  const pages = Math.max(1, Math.ceil(orders.length / PER_PAGE));
  const pageItems = useMemo(() => orders.slice((page - 1) * PER_PAGE, page * PER_PAGE), [orders, page]);

  const viewDetail = async (id: number) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const o = await api.orders.get(id);
      setDetail(o);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDetailLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-12 text-center">
        <p className="text-xl text-muted mb-4">برای مشاهده سفارشات وارد شوید</p>
        <Link to="/login" className="inline-block px-8 py-3 bg-accent text-white rounded-lg">ورود به حساب</Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-12">
        <div className="text-center py-32 text-muted"><p className="text-4xl animate-pulse">✦</p></div>
      </main>
    );
  }

  if (error) {
    return <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-12"><p className="text-accent text-center">{error}</p></main>;
  }

  if (!orders.length) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-12 text-center">
        <p className="text-xl text-muted mb-4">هنوز سفارشی ثبت نشده</p>
        <Link to="/shop" className="inline-block px-8 py-3 bg-accent text-white rounded-lg">شروع خرید</Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-12">
      <h1 className="text-3xl font-bold text-right mb-8">سفارشات من</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-accent">{active.toLocaleString('fa-IR')}</p>
          <p className="text-xs text-muted mt-1">سفارش فعال</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-body">{orders.length.toLocaleString('fa-IR')}</p>
          <p className="text-xs text-muted mt-1">کل سفارش‌ها</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-body">{totalAmt.toLocaleString('fa-IR')} ت</p>
          <p className="text-xs text-muted mt-1">مجموع خرید</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="admin-table-head">
            <tr>
              <th className="p-4 text-right font-medium">شماره سفارش</th>
              <th className="p-4 text-right font-medium">تاریخ</th>
              <th className="p-4 text-right font-medium">مبلغ</th>
              <th className="p-4 text-right font-medium">وضعیت</th>
              <th className="p-4 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((o) => {
              const st = statusLabel(o.status || '', statusMap);
              return (
                <tr key={o.id ?? o.order_number} className="border-t border-border hover:bg-row">
                  <td className="p-4 font-medium">{o.order_number || o.number || '-'}</td>
                  <td className="p-4 text-muted">{formatDate(o.created_at)}</td>
                  <td className="p-4 font-bold">{formatPrice(Number(o.total_amount ?? o.total ?? 0))}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                  <td className="p-4 text-left">
                    <button onClick={() => viewDetail(Number(o.id))} className="text-accent hover:underline">جزئیات</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-40">قبلی</button>
          <span className="text-sm text-muted">{page.toLocaleString('fa-IR')} / {pages.toLocaleString('fa-IR')}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-40">بعدی</button>
        </div>
      )}

      {detail !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 className="text-lg font-bold text-body">جزئیات سفارش</h3>
              <button onClick={() => setDetail(null)} className="text-muted hover:text-body p-1">✕</button>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1 text-right">
              {detailLoading ? (
                <p className="text-center text-muted py-8">در حال بارگذاری...</p>
              ) : detail ? (
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-muted">شماره سفارش</span><span className="font-medium">{detail.order_number || detail.number || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted">تاریخ</span><span>{formatDate(detail.created_at)}</span></div>
                  <div className="flex justify-between"><span className="text-muted">مبلغ</span><span className="font-bold">{formatPrice(Number(detail.total_amount ?? detail.total ?? 0))}</span></div>
                  <div className="flex justify-between"><span className="text-muted">وضعیت</span><span>{statusLabel(detail.status || '', statusMap).label}</span></div>
                  {detail.shipping_address ? <div className="border-t border-border pt-3"><p className="text-muted text-sm mb-1">آدرس ارسال</p><p className="text-sm">{String(detail.shipping_address)}</p></div> : null}
                  {Array.isArray(detail.items) && detail.items.length > 0 && (
                    <div className="border-t border-border pt-3">
                      <p className="text-muted text-sm mb-2">اقلام</p>
                      <ul className="space-y-1 text-sm">
                        {detail.items.map((it, i) => (<li key={i} className="flex justify-between"><span>{it.name || `#${it.product_id}`}</span><span className="text-muted">× {it.qty || 1}</span></li>))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted py-8">اطلاعاتی یافت نشد</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default OrdersPage;
