import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { loadIranLocations, type IranLocations } from '../lib/utils/iranLocations';
import { toast } from '../lib/utils/toast';
import type { Address } from '../types';

const emptyForm = { title: '', receiver: '', phone: '', province: '', city: '', postal_code: '', address: '', is_default: false };

export function ProfilePage() {
  const cfg = useStoreConfig();
  const { isLoggedIn } = useAuth();
  const t = cfg.texts.profile;
  const maxAddresses = cfg.addresses.maxCount || 3;
  usePageTitle(`پروفایل | ${cfg.name}`);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [locations, setLocations] = useState<IranLocations | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [provinceId, setProvinceId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    loadIranLocations(cfg.data.iranLocations).then(setLocations).catch(() => setLocations(null));
    api.users.getAddresses()
      .then((data) => {
        const arr = Array.isArray(data) ? data : ((data as { data?: Address[] })?.data || (data as { addresses?: Address[] })?.addresses || []);
        setAddresses(arr);
      })
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn, cfg.data.iranLocations]);

  const cities = useMemo(() => (locations && provinceId ? locations.getCities(provinceId) : []), [locations, provinceId]);

  const reload = async () => {
    const data = await api.users.getAddresses();
    const arr = Array.isArray(data) ? data : ((data as { data?: Address[] })?.data || []);
    setAddresses(arr);
  };

  const openAdd = () => {
    if (addresses.length >= maxAddresses) {
      toast(t.maxReached, 'warning');
      return;
    }
    setEditingId(null);
    setForm({ ...emptyForm });
    setProvinceId('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id ?? null);
    setForm({
      title: addr.title || '',
      receiver: addr.receiver || addr.receiver_name || '',
      phone: addr.phone || '',
      province: addr.province || '',
      city: addr.city || '',
      postal_code: addr.postal_code || '',
      address: addr.address || '',
      is_default: !!addr.is_default,
    });
    const pid = locations?.provinces.find((p) => p.name === addr.province)?.id || '';
    setProvinceId(pid);
    setFormError('');
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.receiver || !form.phone || !provinceId || !form.city || !form.address) {
      setFormError('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }
    const provinceName = locations?.provinces.find((p) => p.id === provinceId)?.name || form.province;
    const body = { ...form, province: provinceName, is_default: form.is_default ? 1 : 0 };
    setSaving(true);
    try {
      if (editingId) {
        await api.users.updateAddress(editingId, body);
        toast(t.updated, 'success');
      } else {
        await api.users.addAddress(body);
        toast(t.saved, 'success');
      }
      await reload();
      setModalOpen(false);
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await api.users.deleteAddress(id);
      toast(t.deleted, 'success');
      await reload();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const setDefault = async (id: number) => {
    try {
      await api.users.updateAddress(id, { is_default: 1 });
      await reload();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="max-w-[900px] mx-auto px-4 md:px-10 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
        <p className="text-muted mb-6">{t.needLogin}</p>
        <Link to="/login" className="inline-block px-8 py-3 bg-accent text-white rounded-lg">{t.loginBtn}</Link>
      </main>
    );
  }

  return (
    <main className="max-w-[900px] mx-auto px-4 md:px-10 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-right">{t.title}</h1>
        <Link to="/orders" className="text-sm text-muted hover:text-accent">{t.ordersLink}</Link>
      </div>
      <p className="text-muted text-right mb-8">{t.subtitle}</p>

      <div className="flex items-center justify-between mb-6">
        <button onClick={openAdd} disabled={addresses.length >= maxAddresses} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm disabled:opacity-50" title={addresses.length >= maxAddresses ? t.maxReached : ''}>
          <Plus className="w-4 h-4" /> {t.addAddress}
        </button>
        <p className="text-xs text-muted">{addresses.length.toLocaleString('fa-IR')} از {maxAddresses.toLocaleString('fa-IR')} آدرس</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted">در حال بارگذاری...</div>
      ) : !addresses.length ? (
        <div className="bg-card border border-border rounded-xl py-16 text-center text-muted">{t.empty}</div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={String(addr.id)} className="bg-card border border-border rounded-xl p-5 text-right">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{addr.title || `${addr.province}، ${addr.city}`}</h3>
                    {Number(addr.is_default) === 1 && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{t.defaultBadge}</span>}
                  </div>
                  <p className="text-sm text-muted mb-1">{addr.address}</p>
                  <p className="text-xs text-muted">{addr.receiver} · {addr.phone}{addr.postal_code ? ` · کد پستی: ${addr.postal_code}` : ''}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => openEdit(addr)} className="text-sm text-muted hover:text-accent">{cfg.texts.admin.common.edit}</button>
                  {Number(addr.is_default) !== 1 && <button onClick={() => setDefault(Number(addr.id))} className="text-sm text-muted hover:text-accent">{t.setDefault}</button>}
                  <button onClick={() => remove(Number(addr.id))} className="text-sm text-muted hover:text-red-500">{t.deleteAddress}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-lg font-bold">{editingId ? t.editAddress : t.addAddress}</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-body p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-4 text-right">
              <div>
                <label className="block text-sm text-muted mb-1">{t.titleLabel}</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t.titlePlaceholder} className="admin-input rounded-lg px-3 py-2 text-sm w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted mb-1">{t.receiverLabel}</label>
                  <input value={form.receiver} onChange={(e) => setForm({ ...form, receiver: e.target.value })} className="admin-input rounded-lg px-3 py-2 text-sm w-full" />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">{t.phoneLabel}</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="admin-input rounded-lg px-3 py-2 text-sm w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted mb-1">{t.provinceLabel}</label>
                  <select value={provinceId} onChange={(e) => { setProvinceId(e.target.value); setForm({ ...form, city: '' }); }} disabled={!locations} className="admin-input rounded-lg px-3 py-2 text-sm w-full">
                    <option value="">انتخاب استان...</option>
                    {locations?.provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">{t.cityLabel}</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={!cities.length} className="admin-input rounded-lg px-3 py-2 text-sm w-full">
                    <option value="">انتخاب شهر...</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">{t.postalLabel}</label>
                <input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="admin-input rounded-lg px-3 py-2 text-sm w-full" />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">{t.addressLabel}</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={t.addressPlaceholder} rows={3} className="admin-input rounded-lg px-3 py-2 text-sm w-full" />
              </div>
              <label className="flex items-center gap-3 flex-row-reverse cursor-pointer">
                <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm text-muted">{t.defaultLabel}</span>
              </label>
              {formError && <p className="text-sm text-accent">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={submit} disabled={saving} className="flex-1 py-3 bg-accent text-white rounded-lg font-medium disabled:opacity-50">{editingId ? cfg.texts.admin.common.save : t.save}</button>
                <button onClick={() => setModalOpen(false)} className="px-6 py-3 border border-border rounded-lg text-muted">{t.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProfilePage;
