import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, ExternalLink } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { AdminHeader } from './ui';
import { deepMerge } from '../lib/utils/deepMerge';
import { toast } from '../lib/utils/toast';

type PageKey = 'about' | 'contact' | 'terms' | 'privacy' | 'refund' | 'faq';

const PREVIEW_PATH: Record<PageKey, string> = {
  about: '/about',
  contact: '/contact',
  terms: '/terms',
  privacy: '/privacy',
  refund: '/refund',
  faq: '/faq',
};

const INPUT = 'w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none';

export function AdminPagesPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.pages as unknown as {
    title: string; subtitle: string; save: string; saving: string; saved: string;
    preview: string; lastUpdated: string; tabs: Record<PageKey, string>;
    addSection: string; addFaq: string; remove: string;
  };
  const [tab, setTab] = useState<PageKey>('about');
  const [legal, setLegal] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const getDefault = () => JSON.parse(JSON.stringify(cfg.texts.legal || {})) as Record<string, unknown>;

  useEffect(() => {
    (async () => {
      try {
        const settings = (await api.settings.adminGet()) as { legal_content?: Record<string, unknown> };
        const base = getDefault();
        if (settings.legal_content) deepMerge(base as unknown as Record<string, unknown>, settings.legal_content);
        setLegal(base);
      } catch (e) {
        toast((e as Error).message, 'error');
        setLegal(getDefault());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!legal) return;
    setSaving(true);
    try {
      await api.settings.adminUpdate({ legal_content: legal });
      toast(t.saved);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !legal) return <div className="text-center py-20 text-dim">{cfg.texts.admin.loading}</div>;

  const pageData = (legal[tab] || {}) as Record<string, unknown>;
  const setPageData = (next: Record<string, unknown>) => setLegal({ ...legal, [tab]: next });

  return (
    <section>
      <AdminHeader title={t.title} subtitle={t.subtitle} />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(Object.keys(t.tabs) as PageKey[]).map((key) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === key ? 'bg-accent text-white' : 'text-muted hover:bg-surface'}`}>
            {t.tabs[key]}
          </button>
        ))}
        <a href={`#${PREVIEW_PATH[tab]}`} onClick={(e) => { e.preventDefault(); window.open(PREVIEW_PATH[tab], '_blank'); }} className="mr-auto px-3 py-2 text-sm text-muted hover:text-accent flex items-center gap-1">
          <ExternalLink className="w-4 h-4" /> {t.preview}
        </a>
      </div>

      <div className="bg-body border border-border rounded-2xl p-6 space-y-5 text-right">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-muted mb-2 text-sm">عنوان</label>
            <input value={String(pageData.title || '')} onChange={(e) => setPageData({ ...pageData, title: e.target.value })} className={INPUT} />
          </div>
          <div>
            <label className="block text-muted mb-2 text-sm">زیرعنوان</label>
            <input value={String(pageData.subtitle || '')} onChange={(e) => setPageData({ ...pageData, subtitle: e.target.value })} className={INPUT} />
          </div>
        </div>

        {tab === 'about' && <AboutEditor data={pageData} onChange={setPageData} addLabel={t.addSection} />}
        {tab === 'contact' && <ContactEditor data={pageData} onChange={setPageData} />}
        {(tab === 'terms' || tab === 'privacy' || tab === 'refund') && (
          <SectionsEditor data={pageData} onChange={setPageData} addLabel={t.addSection} />
        )}
        {tab === 'faq' && <FaqEditor data={pageData} onChange={setPageData} addLabel={t.addFaq} />}

        <div className="border-t border-border pt-4 flex justify-end">
          <button onClick={save} disabled={saving} className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </section>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-muted mb-2 text-sm">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${INPUT} resize-y`} />
    </div>
  );
}

function AboutEditor({ data, onChange, addLabel }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; addLabel: string }) {
  const why = (data.whyChooseUs as { icon?: string; title?: string; desc?: string }[]) || [];
  const stats = (data.stats as { value?: string; label?: string }[]) || [];
  const team = (data.team as { name?: string; role?: string }[]) || [];
  return (
    <div className="space-y-4">
      <TextArea label="معرفی" value={String(data.intro || '')} onChange={(v) => onChange({ ...data, intro: v })} />
      <TextArea label="ماموریت" value={String(data.mission || '')} onChange={(v) => onChange({ ...data, mission: v })} />
      <TextArea label="چشم‌انداز" value={String(data.vision || '')} onChange={(v) => onChange({ ...data, vision: v })} />

      <div>
        <div className="flex items-center justify-between mb-2"><label className="text-muted text-sm">چرا ما؟</label></div>
        <div className="space-y-2">
          {why.map((w, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input value={String(w.icon || '')} onChange={(e) => onChange({ ...data, whyChooseUs: why.map((x, j) => j === i ? { ...x, icon: e.target.value } : x) })} placeholder="آیکون" className={`${INPUT} col-span-3`} />
              <input value={String(w.title || '')} onChange={(e) => onChange({ ...data, whyChooseUs: why.map((x, j) => j === i ? { ...x, title: e.target.value } : x) })} placeholder="عنوان" className={`${INPUT} col-span-4`} />
              <input value={String(w.desc || '')} onChange={(e) => onChange({ ...data, whyChooseUs: why.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) })} placeholder="توضیح" className={`${INPUT} col-span-4`} />
              <button onClick={() => onChange({ ...data, whyChooseUs: why.filter((_, j) => j !== i) })} className="col-span-1 text-accent flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => onChange({ ...data, whyChooseUs: [...why, { icon: 'check', title: '', desc: '' }] })} className="mt-2 text-sm text-accent flex items-center gap-1"><Plus className="w-4 h-4" /> {addLabel}</button>
      </div>

      <div>
        <label className="text-muted text-sm block mb-2">آمار</label>
        <div className="space-y-2">
          {stats.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input value={String(s.value || '')} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x) })} placeholder="مقدار" className={`${INPUT} col-span-5`} />
              <input value={String(s.label || '')} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} placeholder="برچسب" className={`${INPUT} col-span-6`} />
              <button onClick={() => onChange({ ...data, stats: stats.filter((_, j) => j !== i) })} className="col-span-1 text-accent flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => onChange({ ...data, stats: [...stats, { value: '', label: '' }] })} className="mt-2 text-sm text-accent flex items-center gap-1"><Plus className="w-4 h-4" /> {addLabel}</button>
      </div>

      <div>
        <label className="text-muted text-sm block mb-2">تیم</label>
        <div className="space-y-2">
          {team.map((m, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input value={String(m.name || '')} onChange={(e) => onChange({ ...data, team: team.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} placeholder="نام" className={`${INPUT} col-span-5`} />
              <input value={String(m.role || '')} onChange={(e) => onChange({ ...data, team: team.map((x, j) => j === i ? { ...x, role: e.target.value } : x) })} placeholder="نقش" className={`${INPUT} col-span-6`} />
              <button onClick={() => onChange({ ...data, team: team.filter((_, j) => j !== i) })} className="col-span-1 text-accent flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => onChange({ ...data, team: [...team, { name: '', role: '' }] })} className="mt-2 text-sm text-accent flex items-center gap-1"><Plus className="w-4 h-4" /> {addLabel}</button>
      </div>
    </div>
  );
}

function ContactEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const fields = ['phone', 'email', 'address', 'hours'] as const;
  return (
    <div className="space-y-4">
      {fields.map((f) => {
        const item = (data[f] as { label?: string; value?: string; note?: string }) || {};
        return (
          <div key={f} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={String(item.label || '')} onChange={(e) => onChange({ ...data, [f]: { ...item, label: e.target.value } })} placeholder="برچسب" className={INPUT} />
            <input value={String(item.value || '')} onChange={(e) => onChange({ ...data, [f]: { ...item, value: e.target.value } })} placeholder="مقدار" className={INPUT} />
            <input value={String(item.note || '')} onChange={(e) => onChange({ ...data, [f]: { ...item, note: e.target.value } })} placeholder="یادداشت" className={INPUT} />
          </div>
        );
      })}
    </div>
  );
}

function SectionsEditor({ data, onChange, addLabel }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; addLabel: string }) {
  const sections = (data.sections as { title?: string; content?: string[]; items?: string[] }[]) || [];
  const setSections = (s: typeof sections) => onChange({ ...data, sections: s });
  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <div key={i} className="border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input value={String(s.title || '')} onChange={(e) => setSections(sections.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="عنوان بخش" className={`${INPUT} flex-1`} />
            <button onClick={() => setSections(sections.filter((_, j) => j !== i))} className="text-accent p-2"><Trash2 className="w-4 h-4" /></button>
          </div>
          <textarea value={(s.content || []).join('\n')} onChange={(e) => setSections(sections.map((x, j) => j === i ? { ...x, content: e.target.value.split('\n') } : x))} rows={3} placeholder="متن‌ها (هر خط یک پاراگراف)" className={`${INPUT} resize-y`} />
          <textarea value={(s.items || []).join('\n')} onChange={(e) => setSections(sections.map((x, j) => j === i ? { ...x, items: e.target.value.split('\n') } : x))} rows={2} placeholder="موارد (هر خط یک مورد)" className={`${INPUT} resize-y`} />
        </div>
      ))}
      <button onClick={() => setSections([...sections, { title: '', content: [], items: [] }])} className="text-sm text-accent flex items-center gap-1"><Plus className="w-4 h-4" /> {addLabel}</button>
    </div>
  );
}

function FaqEditor({ data, onChange, addLabel }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; addLabel: string }) {
  const items = (data.items as { question?: string; answer?: string }[]) || [];
  const setItems = (it: typeof items) => onChange({ ...data, items: it });
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input value={String(it.question || '')} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} placeholder="سوال" className={`${INPUT} flex-1`} />
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-accent p-2"><Trash2 className="w-4 h-4" /></button>
          </div>
          <textarea value={String(it.answer || '')} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} rows={2} placeholder="پاسخ" className={`${INPUT} resize-y`} />
        </div>
      ))}
      <button onClick={() => setItems([...items, { question: '', answer: '' }])} className="text-sm text-accent flex items-center gap-1"><Plus className="w-4 h-4" /> {addLabel}</button>
    </div>
  );
}

export default AdminPagesPage;
