import { useEffect, useState } from 'react';
import { Plus, X, Percent, Tag } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { AdminHeader, EmptyState } from './ui';
import { toast } from '../lib/utils/toast';
import type { Discount } from '../types';

export function AdminDiscountsPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.discounts;
  const common = cfg.texts.admin.common;

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', valid_from: '', valid_to: '' });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const list = (await api.discounts.list()) as Discount[] | { data?: Discount[] };
      setDiscounts(Array.isArray(list) ? list : list?.data ?? []);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.code || !form.value) {
      setError(common.codeValueRequired);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.discounts.create({ ...form, value: Number(form.value) } as Record<string, unknown>);
      toast('کد تخفیف ایجاد شد');
      setModalOpen(false);
      setForm({ code: '', type: 'percent', value: '', valid_from: '', valid_to: '' });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: number) => {
    try {
      await api.discounts.deactivate(id);
      toast('کد تخفیف غیرفعال شد');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف شود؟')) return;
    try {
      await api.discounts.delete(id);
      toast('کد تخفیف حذف شد');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  return (
    <section>
      <AdminHeader
        title={t.title}
        subtitle={t.subtitle}
        action={
          <button onClick={() => setModalOpen(true)} className="bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-black/10">
            <Plus className="w-5 h-5" /> {t.add}
          </button>
        }
      />

      {loading ? (
        <div className="text-center py-12 text-dim">{t.loading}</div>
      ) : !discounts.length ? (
        <EmptyState text={t.empty} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {discounts.map((d) => {
            const now = new Date();
            const validTo = (d as { valid_to?: string }).valid_to || d.expires_at ? new Date((d as { valid_to?: string }).valid_to || d.expires_at || '') : null;
            const expired = validTo && validTo < now;
            const active = (d.active ?? (d as { is_active?: boolean }).is_active) && !expired;
            const statusBadge = active
              ? 'bg-green-100 text-green-800 border border-green-200'
              : expired
                ? 'bg-card text-muted border border-border'
                : 'bg-surface text-dim border border-border';
            const statusLabel = active ? t.active : expired ? t.expired : t.inactive;
            const valueLabel = d.type === 'percent' ? `${d.value}${t.percentOff}` : `${Number(d.value).toLocaleString('fa-IR')} ${t.fixedOff}`;
            const validFrom = (d as { valid_from?: string }).valid_from;
            const validToStr = (d as { valid_to?: string }).valid_to || d.expires_at;
            return (
              <div key={d.id} className="admin-card rounded-2xl p-5 flex flex-col gap-4 hover:border-accent/30 transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-black text-body tracking-widest text-base bg-card border border-border px-3 py-1.5 rounded-lg select-all">{d.code}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap ${statusBadge}`}>{statusLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  {d.type === 'percent' ? <Percent className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                  <span className="text-body font-bold text-sm">{valueLabel}</span>
                </div>
                <div className="flex gap-4 text-xs text-dim">
                  {validFrom && <span>از {new Date(validFrom).toLocaleDateString('fa-IR')}</span>}
                  {validToStr ? <span>تا {new Date(validToStr).toLocaleDateString('fa-IR')}</span> : <span>{t.noExpiry}</span>}
                </div>
                <div className="flex gap-2 pt-1 border-t border-border">
                  {active && (
                    <button onClick={() => deactivate(d.id)} className="flex-1 py-2 text-xs font-bold bg-surface hover:bg-card text-muted hover:text-body border border-border rounded-lg transition-all">
                      {t.deactivate}
                    </button>
                  )}
                  <button onClick={() => remove(d.id)} className="flex-1 py-2 text-xs font-bold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 hover:border-accent/60 rounded-lg transition-all">
                    {t.delete}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-body border border-border rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-body">{t.modalTitle}</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-body p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4 text-right">
              <div>
                <label className="block text-muted mb-2 text-sm">کد تخفیف</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} dir="ltr" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted mb-2 text-sm">نوع</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none">
                    <option value="percent">درصد</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted mb-2 text-sm">مقدار</label>
                  <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} inputMode="numeric" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted mb-2 text-sm">از تاریخ</label>
                  <input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-muted mb-2 text-sm">تا تاریخ</label>
                  <input type="date" value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
                </div>
              </div>
              {error && <p className="text-sm text-accent">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={submit} disabled={saving} className="flex-1 py-3 bg-accent text-white rounded-xl font-medium disabled:opacity-50">{saving ? '...' : t.create}</button>
                <button onClick={() => setModalOpen(false)} className="px-6 py-3 border border-border rounded-xl text-muted">{common.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminDiscountsPage;
