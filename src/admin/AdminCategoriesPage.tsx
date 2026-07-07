import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { AdminHeader, EmptyState } from './ui';
import { toast } from '../lib/utils/toast';
import type { Category } from '../types';

export function AdminCategoriesPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.categories;
  const common = cfg.texts.admin.common;

  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = (await api.categories.list()) as Category[] | { data?: Category[] };
      setCats(Array.isArray(res) ? res : res?.data ?? []);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setImagePreview('');
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug || '');
    setImagePreview(c.poster_image || c.main_image || c.image_url || '');
    setImageFile(null);
    setModalOpen(true);
  };

  const onPickImage = (file: File | undefined) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!name.trim()) return toast(common.nameRequired, 'error');
    setSaving(true);
    try {
      let catId = editingId;
      const payload = { name: name.trim(), slug: slug.trim() };
      if (editingId) {
        await api.categories.update(editingId, payload);
        toast('دسته‌بندی بروزرسانی شد');
      } else {
        const res = (await api.categories.create(payload)) as { id?: number; data?: { id?: number } };
        catId = res?.id || res?.data?.id || null;
        toast('دسته‌بندی ایجاد شد');
      }
      if (catId && imageFile) {
        try {
          await api.categories.uploadPoster(catId, imageFile);
        } catch (e) {
          toast('ذخیره شد ولی آپلود پوستر ناموفق: ' + (e as Error).message, 'info');
        }
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number, name: string) => {
    if (!confirm(`حذف دسته‌بندی "${name}"؟`)) return;
    try {
      await api.categories.delete(id);
      toast('دسته‌بندی حذف شد');
      setCats((c) => c.filter((x) => x.id !== id));
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
          <button onClick={openAdd} className="bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-black/10">
            <Plus className="w-5 h-5" /> {t.add}
          </button>
        }
      />

      <div className="bg-body border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="admin-table-head">
            <tr>
              <th className="px-5 py-4 text-right text-xs font-medium text-muted">#</th>
              <th className="px-5 py-4 text-right text-xs font-medium text-muted">نام</th>
              <th className="px-5 py-4 text-right text-xs font-medium text-muted">slug</th>
              <th className="px-5 py-4 text-right text-xs font-medium text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12 text-dim">{cfg.texts.admin.loading}</td></tr>
            ) : !cats.length ? (
              <tr><td colSpan={4}><EmptyState text={t.empty} /></td></tr>
            ) : (
              cats.map((c, i) => {
                const img = c.poster_image || c.main_image || c.image_url || '';
                return (
                  <tr key={c.id} className="hover:bg-row transition-colors border-t border-border">
                    <td className="px-5 py-4 text-dim text-sm">{(i + 1).toLocaleString('fa-IR')}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img src={img} alt={c.name} className="w-10 h-10 rounded-xl object-cover bg-surface" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-dim">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <span className="font-medium text-body">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted text-sm font-mono" dir="ltr">{c.slug || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title={common.edit}>
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => remove(c.id, c.name)} className="p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors" title={common.delete}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-body border border-border rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-body">{editingId ? t.modalEdit : t.modalAdd}</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-body p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4 text-right">
              <div>
                <label className="block text-muted mb-2 text-sm">نام *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-muted mb-2 text-sm">slug</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-muted mb-2 text-sm">{t.selectImage}</label>
                <div className="flex items-center gap-3 flex-row-reverse">
                  <button type="button" onClick={() => document.getElementById('catImageInput')?.click()} className="px-4 py-2 bg-card border border-border rounded-xl text-sm text-muted hover:text-body">
                    {imagePreview ? 'تغییر تصویر' : t.selectImage}
                  </button>
                  {imagePreview && <img src={imagePreview} alt="preview" className="w-12 h-12 rounded-xl object-cover" />}
                  <input id="catImageInput" type="file" accept="image/*" className="hidden" onChange={(e) => onPickImage(e.target.files?.[0])} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={submit} disabled={saving} className="flex-1 py-3 bg-accent text-white rounded-xl font-medium disabled:opacity-50">
                  {saving ? '...' : editingId ? t.update : t.save}
                </button>
                <button onClick={() => setModalOpen(false)} className="px-6 py-3 border border-border rounded-xl text-muted">{common.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminCategoriesPage;
