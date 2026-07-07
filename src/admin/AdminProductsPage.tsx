import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { AdminHeader, EmptyState } from './ui';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { formatPrice } from '../lib/utils/priceFormatter';
import { toast } from '../lib/utils/toast';
import type { Product, Category, ProductListResponse } from '../types';

function statusBadge(status: string, t: Record<string, string>) {
  const map: Record<string, [string, string]> = {
    draft: ['bg-card text-muted', t.statusDraft],
    active: ['bg-green-100 text-green-800', t.statusActive],
    archived: ['bg-red-100 text-red-700', t.statusArchived],
  };
  const [cls, label] = map[status] || map.draft;
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

export function AdminProductsPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.products;
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [data, catsRes] = await Promise.all([api.products.list({ limit: 100 }), api.categories.list()]);
      const list = (data as ProductListResponse)?.data ?? (Array.isArray(data) ? (data as Product[]) : []);
      setProducts(list);
      setCategories(Array.isArray(catsRes) ? (catsRes as Category[]) : ((catsRes as { data?: Category[] })?.data ?? []));
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (catFilter && String(p.category_id) !== catFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.category_name || '').toLowerCase().includes(q);
    });
  }, [products, search, catFilter]);

  const remove = async (id: number, name: string) => {
    if (!confirm(`آیا از حذف "${name}" مطمئن هستید؟`)) return;
    try {
      await api.products.delete(id);
      toast('محصول حذف شد');
      setProducts((p) => p.filter((x) => x.id !== id));
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
          <button onClick={() => navigate('/admin/products/new')} className="bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-black/10">
            <Plus className="w-5 h-5" />
            <span>{t.add}</span>
          </button>
        }
      />

      <div className="bg-body border border-border rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="bg-card border border-border rounded-xl px-4 py-3 text-body placeholder:text-dim focus:border-accent outline-none"
          />
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none">
            <option value="">{t.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          <div className="hidden lg:block lg:col-span-2" />
        </div>
      </div>

      <div className="bg-body border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="admin-table-head">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">تصویر</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">نام</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">قیمت</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">موجودی</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">واریانت</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">دسته</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">وضعیت</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-dim">{cfg.texts.admin.loading}</td></tr>
            ) : !filtered.length ? (
              <tr><td colSpan={8}><EmptyState text={t.empty} /></td></tr>
            ) : (
              filtered.map((p) => {
                const img = p.main_image || p.images?.find((i) => i.is_main)?.url || p.images?.[0]?.url || '';
                const stockCls = p.stock === 0 ? 'text-accent' : p.stock < 5 ? 'text-yellow-600' : 'text-green-600';
                const px = p as unknown as { price_min?: number; price_max?: number; status?: string };
                const priceLabel =
                  px.price_min != null && px.price_max != null && px.price_min !== px.price_max
                    ? `${formatPrice(px.price_min)} – ${formatPrice(px.price_max)}`
                    : formatPrice(p.price);
                const status = px.status || (p.is_active ? 'active' : 'archived');
                return (
                  <tr key={p.id} className="hover:bg-row transition-colors border-t border-border">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface">
                        <ImageWithFallback src={img} alt={p.name} iconClassName="w-5 h-5" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-body text-sm">{p.name}</p>
                      <p className="text-xs text-dim">{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{priceLabel}</td>
                    <td className={`px-4 py-3 text-sm font-bold ${stockCls}`}>{p.stock ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-muted">{(p as { variant_count?: number }).variant_count ?? 1}</td>
                    <td className="px-4 py-3 text-sm text-muted">{p.category_name || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(status, t)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link to={`/admin/products/${p.id}`} title={cfg.texts.admin.common.edit} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                          <Pencil className="w-5 h-5" />
                        </Link>
                        <button onClick={() => remove(p.id, p.name)} title={cfg.texts.admin.common.delete} className="p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors">
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
    </section>
  );
}

export default AdminProductsPage;
