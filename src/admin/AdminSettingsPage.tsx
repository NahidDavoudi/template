import { useEffect, useState } from 'react';
import { Save, Upload } from 'lucide-react';
import api from '../core/api';
import { mergeStoreSettings } from '../config/bootstrap';
import { useStoreConfig } from '../context/ConfigContext';
import { AdminHeader } from './ui';
import { initTheme } from '../core/theme';
import { toast } from '../lib/utils/toast';
import type { RemoteSettings } from '../config/bootstrap';

type Tab = 'identity' | 'payment' | 'contact' | 'shipping' | 'sms' | 'seo';

const TAB_LABELS: Record<Tab, string> = {
  identity: 'هویت فروشگاه',
  payment: 'پرداخت',
  contact: 'تماس و شبکه‌ها',
  shipping: 'ارسال و سفارش',
  sms: 'پیامک',
  seo: 'سئو',
};

export function AdminSettingsPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.settings;
  const [tab, setTab] = useState<Tab>('identity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [enamadHtml, setEnamadHtml] = useState('');

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const populate = (data: RemoteSettings) => {
    setForm({ ...data });
    setEnamadHtml(String((data as { enamad_html?: string }).enamad_html || ''));
  };

  useEffect(() => {
    (async () => {
      try {
        const data = (await api.settings.adminGet()) as RemoteSettings;
        populate(data);
      } catch (e) {
        toast((e as Error).message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const collect = (): Record<string, unknown> => ({
    shop_name: form.shop_name || '',
    shop_slogan: form.shop_slogan || '',
    shop_description: form.shop_description || '',
    bank_card: form.bank_card || '',
    bank_owner: form.bank_owner || '',
    payment_method: form.payment_method || 'card',
    zarinpal_merchant_id: form.zarinpal_merchant_id || null,
    contact_phone: form.contact_phone || '',
    contact_email: form.contact_email || '',
    contact_address: form.contact_address || '',
    social_instagram: form.social_instagram || '',
    social_telegram: form.social_telegram || '',
    social_whatsapp: form.social_whatsapp || '',
    shipping_standard_cost: Number(form.shipping_standard_cost || 0),
    shipping_free_from: Number(form.shipping_free_from || 0),
    min_order_amount: Number(form.min_order_amount || 0),
    sms_enabled: form.sms_enabled ? 1 : 0,
    sms_provider: form.sms_provider || '',
    sms_api_key: form.sms_api_key || null,
    meta_title: form.meta_title || '',
    meta_description: form.meta_description || '',
    enamad_html: enamadHtml || null,
  });

  const save = async () => {
    setSaving(true);
    try {
      const data = (await api.settings.adminUpdate(collect())) as RemoteSettings;
      populate(data);
      mergeStoreSettings(data);
      initTheme();
      toast(t.saved);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (type: 'logo' | 'hero' | 'favicon', file: File | undefined) => {
    if (!file) return;
    try {
      const result = (await api.settings.uploadImage(type, file)) as { settings?: RemoteSettings } & RemoteSettings;
      const settings = (result.settings || result) as RemoteSettings;
      populate(settings);
      mergeStoreSettings(settings);
      initTheme();
      toast(t.uploadSuccess);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (loading) return <div className="text-center py-20 text-dim">{cfg.texts.admin.loading}</div>;

  const paymentMethod = String(form.payment_method || 'card');
  const smsEnabled = !!Number(form.sms_enabled);

  return (
    <section>
      <AdminHeader title={t.title} subtitle={t.subtitle} />

      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(TAB_LABELS) as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === key ? 'bg-accent text-white' : 'text-muted hover:bg-surface'}`}
          >
            {t.tabs[key]}
          </button>
        ))}
      </div>

      <div className="bg-body border border-border rounded-2xl p-6 space-y-5 text-right">
        {tab === 'identity' && (
          <>
            <Field label={t.identity.shopName}><input value={String(form.shop_name || '')} onChange={(e) => set('shop_name', e.target.value)} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.identity.shopSlogan}><input value={String(form.shop_slogan || '')} onChange={(e) => set('shop_slogan', e.target.value)} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.identity.shopDescription}><textarea value={String(form.shop_description || '')} onChange={(e) => set('shop_description', e.target.value)} rows={3} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <ImageRow label={t.identity.logo} url={String(form.shop_logo || '')} onPick={(f) => uploadImage('logo', f)} />
            <ImageRow label={t.identity.heroImage} url={String(form.shop_hero_image || '')} onPick={(f) => uploadImage('hero', f)} />
            <ImageRow label={t.identity.favicon} url={String(form.shop_favicon || '')} onPick={(f) => uploadImage('favicon', f)} />
          </>
        )}

        {tab === 'payment' && (
          <>
            <Field label={t.payment.method}>
              <select value={paymentMethod} onChange={(e) => set('payment_method', e.target.value)} className="admin-input rounded-xl px-4 py-3 w-full">
                <option value="card">{t.payment.cardToCard}</option>
                <option value="zarinpal">{t.payment.zarinpal}</option>
                <option value="both">{t.payment.both}</option>
              </select>
            </Field>
            <Field label={t.payment.bankCard}><input value={String(form.bank_card || '')} onChange={(e) => set('bank_card', e.target.value)} dir="ltr" className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.payment.bankOwner}><input value={String(form.bank_owner || '')} onChange={(e) => set('bank_owner', e.target.value)} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            {(paymentMethod === 'zarinpal' || paymentMethod === 'both') && (
              <Field label={t.payment.merchantId}><input value={String(form.zarinpal_merchant_id || '')} onChange={(e) => set('zarinpal_merchant_id', e.target.value)} dir="ltr" className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            )}
          </>
        )}

        {tab === 'contact' && (
          <>
            <Field label={t.contact.phone}><input value={String(form.contact_phone || '')} onChange={(e) => set('contact_phone', e.target.value)} dir="ltr" className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.contact.email}><input value={String(form.contact_email || '')} onChange={(e) => set('contact_email', e.target.value)} dir="ltr" className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.contact.address}><textarea value={String(form.contact_address || '')} onChange={(e) => set('contact_address', e.target.value)} rows={2} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.contact.instagram}><input value={String(form.social_instagram || '')} onChange={(e) => set('social_instagram', e.target.value)} dir="ltr" className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.contact.telegram}><input value={String(form.social_telegram || '')} onChange={(e) => set('social_telegram', e.target.value)} dir="ltr" className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.contact.whatsapp}><input value={String(form.social_whatsapp || '')} onChange={(e) => set('social_whatsapp', e.target.value)} dir="ltr" className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.contact.enamadLabel} hint={t.contact.enamadHint}>
              <textarea value={enamadHtml} onChange={(e) => setEnamadHtml(e.target.value)} rows={3} dir="ltr" className="admin-input rounded-xl px-4 py-3 w-full font-mono text-xs" />
            </Field>
          </>
        )}

        {tab === 'shipping' && (
          <>
            <Field label={t.shipping.standardCost}><input type="number" value={String(form.shipping_standard_cost || '')} onChange={(e) => set('shipping_standard_cost', e.target.value)} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.shipping.freeFrom}><input type="number" value={String(form.shipping_free_from || '')} onChange={(e) => set('shipping_free_from', e.target.value)} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.shipping.minOrder}><input type="number" value={String(form.min_order_amount || '')} onChange={(e) => set('min_order_amount', e.target.value)} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
          </>
        )}

        {tab === 'sms' && (
          <>
            <label className="flex items-center gap-3 flex-row-reverse">
              <input type="checkbox" checked={smsEnabled} onChange={(e) => set('sms_enabled', e.target.checked ? 1 : 0)} className="w-4 h-4" />
              <span className="text-sm text-muted">{t.sms.enabled}</span>
            </label>
            {smsEnabled && (
              <>
                <Field label={t.sms.provider}><input value={String(form.sms_provider || '')} onChange={(e) => set('sms_provider', e.target.value)} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
                <Field label={t.sms.apiKey}><input value={String(form.sms_api_key || '')} onChange={(e) => set('sms_api_key', e.target.value)} dir="ltr" className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
              </>
            )}
          </>
        )}

        {tab === 'seo' && (
          <>
            <Field label={t.seo.metaTitle}><input value={String(form.meta_title || '')} onChange={(e) => set('meta_title', e.target.value)} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
            <Field label={t.seo.metaDescription}><textarea value={String(form.meta_description || '')} onChange={(e) => set('meta_description', e.target.value)} rows={3} className="admin-input rounded-xl px-4 py-3 w-full" /></Field>
          </>
        )}

        <div className="border-t border-border pt-4 flex justify-end">
          <button onClick={save} disabled={saving} className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-muted mb-2 text-sm">{label}</label>
      {children}
      {hint && <p className="text-xs text-dim mt-1">{hint}</p>}
    </div>
  );
}

function ImageRow({ label, url, onPick }: { label: string; url: string; onPick: (file: File | undefined) => void }) {
  return (
    <div>
      <label className="block text-muted mb-2 text-sm">{label}</label>
      <div className="flex items-center gap-3 flex-row-reverse">
        <label className="px-4 py-2 bg-card border border-border rounded-xl text-sm text-muted hover:text-body cursor-pointer flex items-center gap-2">
          <Upload className="w-4 h-4" /> {url ? 'تغییر تصویر' : 'آپلود تصویر'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
        </label>
        {url && <img src={url} alt={label} className="h-12 w-12 rounded-xl object-cover" />}
      </div>
    </div>
  );
}

export default AdminSettingsPage;
