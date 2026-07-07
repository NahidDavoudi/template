import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { AdminHeader, EmptyState } from './ui';
import { toast } from '../lib/utils/toast';
import type { PromoBanner } from '../types';

export function AdminBannersPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.promoBanners;

  const [list, setList] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = (await api.promoBanners.adminList()) as PromoBanner[] | { data?: PromoBanner[] };
      setList(Array.isArray(res) ? res : res?.data ?? []);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async () => {
    if (!file) return;
    try {
      await api.promoBanners.create(file, title.trim());
      setTitle('');
      setFile(null);
      toast(t.uploadSuccess);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const updateTitle = async (id: number, newTitle: string) => {
    try {
      await api.promoBanners.update(id, { title: newTitle });
      toast(t.saved);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const toggle = async (id: number, active: number) => {
    try {
      await api.promoBanners.update(id, { is_active: active });
      toast(t.saved);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const remove = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await api.promoBanners.delete(id);
      toast(t.deleted);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const move = async (id: number, direction: number) => {
    const idx = list.findIndex((b) => Number(b.id) === Number(id));
    if (idx < 0) return;
    const next = idx + direction;
    if (next < 0 || next >= list.length) return;
    const ids = list.map((b) => b.id);
    [ids[idx], ids[next]] = [ids[next], ids[idx]];
    try {
      await api.promoBanners.reorder(ids as number[]);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  return (
    <section>
      <AdminHeader title={t.title} subtitle={t.subtitle} />

      <div className="bg-body border border-border rounded-2xl p-5 mb-6">
        <p className="text-sm text-muted mb-3">{t.uploadHint}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePlaceholder} className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
          <label className="px-4 py-3 bg-card border border-border rounded-xl text-sm text-muted hover:text-body cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {file ? file.name : 'انتخاب فایل'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <button onClick={upload} disabled={!file} className="px-5 py-3 bg-accent text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t.add}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-dim">{t.loading}</div>
      ) : !list.length ? (
        <EmptyState text={t.empty} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((b, index) => {
            const active = Number((b as { is_active?: number | boolean }).is_active) === 1 || !!(b as { is_active?: boolean }).is_active;
            const imgUrl = (b as { image_url?: string }).image_url || (b as { image?: string }).image || '';
            return (
              <div key={b.id} className="admin-card rounded-2xl overflow-hidden border border-border bg-body flex flex-col">
                <div className="aspect-[21/9] bg-surface overflow-hidden">
                  <img src={imgUrl} alt={b.title || 'پوستر'} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      defaultValue={b.title || ''}
                      placeholder={t.titlePlaceholder}
                      onBlur={(e) => updateTitle(Number(b.id), e.target.value)}
                      className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-body focus:border-accent outline-none"
                    />
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-surface text-dim border border-border'}`}>
                      {active ? t.active : t.inactive}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-auto">
                    <button onClick={() => move(Number(b.id), -1)} disabled={index === 0} className="py-2 px-3 text-xs font-bold bg-surface hover:bg-card text-muted border border-border rounded-lg transition-all disabled:opacity-40">{t.moveUp}</button>
                    <button onClick={() => move(Number(b.id), 1)} disabled={index === list.length - 1} className="py-2 px-3 text-xs font-bold bg-surface hover:bg-card text-muted border border-border rounded-lg transition-all disabled:opacity-40">{t.moveDown}</button>
                    <button onClick={() => toggle(Number(b.id), active ? 0 : 1)} className="flex-1 py-2 text-xs font-bold bg-surface hover:bg-card text-muted border border-border rounded-lg transition-all">{active ? t.deactivate : t.activate}</button>
                    <button onClick={() => remove(Number(b.id))} className="flex-1 py-2 text-xs font-bold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-lg transition-all flex items-center justify-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AdminBannersPage;
