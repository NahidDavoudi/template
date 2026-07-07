import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, X, Eye } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { AdminHeader, EmptyState, StatusBadge } from './ui';
import { formatPrice, formatDate } from '../lib/utils/priceFormatter';
import { toast } from '../lib/utils/toast';
import type { Order } from '../types';

function receiptUrl(o: Order): string {
  return (o.receipt_url as string) || (o as { receipt_path?: string }).receipt_path || (o as { receipt_file?: string }).receipt_file || (o as { receipt?: { file_path?: string } }).receipt?.file_path || '';
}

export function AdminOrdersPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.orders;
  const statusMap = cfg.texts.admin.orderStatuses as Record<string, { label: string; cls: string }>;
  const { id: routeId } = useParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = (await api.orders.adminList({ limit: 200 })) as Order[] | { data?: Order[] } | { orders?: Order[] };
      const list = Array.isArray(data) ? data : ((data as { data?: Order[] })?.data ?? (data as { orders?: Order[] })?.orders ?? []);
      setOrders(list);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (routeId) viewDetail(Number(routeId));
  }, [routeId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (o.order_number || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_phone || '').toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter]);

  const viewDetail = async (id: number) => {
    try {
      const o = await api.orders.adminGet(id);
      setDetail(o);
      setDetailOpen(true);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const changeStatus = async (id: number, status: string) => {
    try {
      await api.orders.updateStatus(id, status);
      toast('وضعیت سفارش بروزرسانی شد');
      setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
      if (detail?.id === id) setDetail({ ...detail, status });
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const approve = async (id: number) => {
    if (!confirm('رسید تایید و سفارش پرداخت‌شده علامت‌گذاری شود؟')) return;
    try {
      await api.orders.approveReceipt(id);
      toast('رسید تایید شد');
      setDetailOpen(false);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const openReject = (id: number) => {
    setRejectId(id);
    setRejectReason('');
    setRejectError('');
    setDetailOpen(false);
    setRejectOpen(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('لطفاً دلیل رد را وارد کنید');
      return;
    }
    if (!rejectId) return;
    try {
      await api.orders.rejectReceipt(rejectId, rejectReason.trim());
      toast('رسید رد شد و سفارش لغو شد');
      setRejectOpen(false);
      setDetailOpen(false);
      load();
    } catch (e) {
      setRejectError((e as Error).message || 'خطا در رد رسید');
    }
  };

  return (
    <section>
      <AdminHeader title={t.title} subtitle={t.subtitle} />

      <div className="bg-body border border-border rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className="bg-card border border-border rounded-xl px-4 py-3 text-body placeholder:text-dim focus:border-accent outline-none" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none">
            <option value="">{t.allStatuses}</option>
            {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-body border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="admin-table-head">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">سفارش</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">مشتری</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">مبلغ</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">تاریخ</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">وضعیت</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-dim">{cfg.texts.admin.loading}</td></tr>
            ) : !filtered.length ? (
              <tr><td colSpan={6}><EmptyState text={t.empty} /></td></tr>
            ) : (
              filtered.map((o) => {
                const rUrl = receiptUrl(o);
                return (
                  <tr key={o.id ?? o.order_number} className="hover:bg-row transition-colors cursor-pointer border-t border-border" onClick={() => o.id && viewDetail(o.id)}>
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm text-body">#{o.order_number}</p>
                      {rUrl && (
                        <div className="flex flex-wrap gap-1 mt-1.5" onClick={(e) => e.stopPropagation()}>
                          <a href={rUrl} target="_blank" rel="noopener" className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">{t.viewReceipt}</a>
                          {o.status === 'pending' && (
                            <>
                              <button onClick={() => o.id && approve(o.id)} className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100">
                                <Check className="w-3 h-3" /> {t.approve}
                              </button>
                              <button onClick={() => o.id && openReject(o.id)} className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-md hover:bg-accent/20">
                                <X className="w-3 h-3" /> {t.reject}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-body">{o.customer_name || '—'}</p>
                      <p className="text-xs text-dim" dir="ltr">{o.customer_phone || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice((o as { total_amount?: number }).total_amount ?? o.total ?? 0)}</td>
                    <td className="px-4 py-3 text-xs text-dim">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status || ''} /></td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button onClick={() => o.id && viewDetail(o.id)} className="text-xs px-2.5 py-1.5 rounded-lg border border-border text-muted hover:text-body hover:border-accent/40 transition-colors flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> جزئیات
                        </button>
                        <select value={o.status || ''} onChange={(e) => o.id && changeStatus(o.id, e.target.value)} className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-body focus:outline-none focus:border-accent">
                          {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {detailOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailOpen(false)}>
          <div className="bg-body border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-body">سفارش #{detail.order_number}</h3>
              <button onClick={() => setDetailOpen(false)} className="text-muted hover:text-body p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3 text-right">
              <Row label="مشتری" value={`${detail.customer_name || '—'} · ${detail.customer_phone || ''}`} />
              <Row label="تاریخ" value={formatDate(detail.created_at)} />
              <Row label="مبلغ" value={formatPrice((detail as { total_amount?: number }).total_amount ?? detail.total ?? 0)} />
              <Row label="وضعیت" value={<StatusBadge status={detail.status || ''} />} />
              {detail.address && <Row label="آدرس" value={detail.address} />}
              {Array.isArray(detail.items) && detail.items.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-muted text-sm mb-2">اقلام</p>
                  <ul className="space-y-1 text-sm">
                    {detail.items.map((it, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{it.name || `#${it.product_id}`}</span>
                        <span className="text-muted">× {it.qty || 1}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {receiptUrl(detail) && (
                <a href={receiptUrl(detail)} target="_blank" rel="noopener" className="inline-block text-sm text-blue-600 hover:underline">{t.viewReceipt}</a>
              )}
              {detail.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t border-border">
                  <button onClick={() => detail.id && approve(detail.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" /> {t.approve}
                  </button>
                  <button onClick={() => detail.id && openReject(detail.id)} className="px-4 py-2 bg-accent text-white rounded-lg text-sm flex items-center gap-1">
                    <X className="w-4 h-4" /> {t.reject}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRejectOpen(false)}>
          <div className="bg-body border border-border rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-body">رد رسید</h3>
              <button onClick={() => setRejectOpen(false)} className="text-muted hover:text-body p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3 text-right">
              <label className="block text-sm text-muted">دلیل رد رسید</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
              {rejectError && <p className="text-sm text-accent">{rejectError}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={submitReject} className="flex-1 py-3 bg-accent text-white rounded-xl font-medium">رد رسید</button>
                <button onClick={() => setRejectOpen(false)} className="px-6 py-3 border border-border rounded-xl text-muted">انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted text-sm shrink-0">{label}</span>
      <span className="text-body text-sm text-left">{value}</span>
    </div>
  );
}

export default AdminOrdersPage;
