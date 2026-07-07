import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Save, X, Star, Trash2 } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { parsePrice, formatPriceInput } from '../lib/utils/priceFormatter';
import { toast } from '../lib/utils/toast';
import type { Category, Product, ProductVariant, ImageVariant } from '../types';

type Tab = 'general' | 'variants' | 'media';

interface AttributeType {
  id?: number;
  slug: string;
  type_slug?: string;
  name: string;
  type_name?: string;
  input_type?: string;
  values?: { id: number; value: string; label: string; swatch_hex?: string }[];
}

export function AdminProductEditorPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.products;
  const common = cfg.texts.admin.common;
  const { id } = useParams();
  const editingId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attrTypes, setAttrTypes] = useState<AttributeType[]>([]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('active');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [featured, setFeatured] = useState(false);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedAxes, setSelectedAxes] = useState<Record<string, number[]>>({});
  const [images, setImages] = useState<ImageVariant[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [catsRes, attrRes] = await Promise.all([api.categories.list(), api.products.listAttributeTypes()]);
        setCategories(Array.isArray(catsRes) ? (catsRes as Category[]) : ((catsRes as { data?: Category[] })?.data ?? []));
        const attrs = Array.isArray(attrRes) ? (attrRes as AttributeType[]) : ((attrRes as { data?: AttributeType[] })?.data ?? []);
        setAttrTypes(attrs);

        if (editingId) {
          const res = (await api.products.get(editingId)) as Product | { data?: Product };
          const p = (res && typeof res === 'object' && 'data' in res ? res.data : res) as Product;
          setName(p.name || '');
          setSlug(p.slug || '');
          setShortDesc(p.short_description || '');
          setDesc(p.description || '');
          setStatus((p as { status?: string }).status || 'active');
          setProductType(((p as { product_type?: string }).product_type as 'simple' | 'variable') || 'simple');
          setPrice(p.price ? formatPriceInput(String(p.price)) : '');
          setStock(String(p.stock ?? 1));
          setCategoryId(p.category_id ? String(p.category_id) : '');
          setFeatured(!!(p as { featured?: boolean }).featured || !!p.is_featured);
          setVariants(p.variants || []);
          setImages(p.images || []);
        }
      } catch (e) {
        toast((e as Error).message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [editingId]);

  const collect = () => ({
    name: name.trim(),
    slug: slug.trim(),
    short_description: shortDesc.trim(),
    description: desc.trim(),
    status,
    product_type: productType,
    price: parsePrice(price),
    stock: parseInt(stock || '0', 10) || 0,
    category_id: categoryId || null,
    featured: featured ? 1 : 0,
  });

  const save = async () => {
    if (!name.trim()) return toast('نام محصول الزامی است', 'error');
    if (productType === 'simple' && !parsePrice(price)) return toast('قیمت محصول الزامی است', 'error');
    setSaving(true);
    try {
      let productId = editingId;
      if (productId) {
        await api.products.update(productId, collect());
      } else {
        const res = (await api.products.create(collect())) as { id?: number; data?: { id?: number } };
        productId = res?.id || res?.data?.id || null;
      }
      if (productId && productType === 'variable') {
        const rows = variants.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: Number(v.price) || 0,
          sale_price: v.sale_price ?? null,
          inventory: v.inventory?.quantity ?? 0,
          is_active: v.is_active ? 1 : 0,
        }));
        if (rows.length) await api.products.bulkUpdateVariants(productId, rows);
      }
      if (productId && pendingFiles.length) {
        let first = images.length === 0;
        for (const f of pendingFiles) {
          if (!f.type.startsWith('image/')) continue;
          try {
            await api.products.uploadImage(productId, f, first, 0);
            first = false;
          } catch (e) {
            toast(`خطا در آپلود ${f.name}: ${(e as Error).message}`, 'error');
          }
        }
      }
      toast(editingId ? 'محصول بروزرسانی شد' : 'محصول ایجاد شد');
      navigate('/admin/products');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const generateVariants = async () => {
    if (!editingId) return toast('ابتدا محصول را ذخیره کنید', 'error');
    const axes = Object.entries(selectedAxes)
      .filter(([, vals]) => vals.length)
      .map(([slug, vals]) => ({ type_slug: slug, value_ids: vals }));
    if (!axes.length) return toast('حداقل یک محور انتخاب کنید', 'error');
    try {
      const res = (await api.products.generateVariants(editingId, axes)) as ProductVariant[];
      setVariants(Array.isArray(res) ? res : ((res as { data?: ProductVariant[] })?.data ?? []));
      setProductType('variable');
      toast('واریانت‌ها ایجاد شدند');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const setMainImage = async (imageId: number) => {
    if (!editingId) return;
    try {
      await api.products.setMainImage(editingId, imageId);
      setImages((imgs) => imgs.map((i) => ({ ...i, is_main: i.id === imageId })));
      toast('تصویر اصلی تنظیم شد');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const deleteImage = async (imageId: number) => {
    if (!editingId || !confirm('این تصویر حذف شود؟')) return;
    try {
      await api.products.deleteImage(editingId, imageId);
      setImages((imgs) => imgs.filter((i) => i.id !== imageId));
      toast('تصویر حذف شد');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: t.tabGeneral },
    { key: 'variants', label: t.tabVariants },
    { key: 'media', label: t.tabMedia },
  ];

  if (loading) {
    return <div className="text-center py-20 text-dim">{cfg.texts.admin.loading}</div>;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/products" className="flex items-center gap-1 text-sm text-muted hover:text-body">
          <ArrowRight className="w-4 h-4" />
          بازگشت به محصولات
        </Link>
        <h1 className="text-xl font-bold text-body">{editingId ? t.modalEdit : t.modalAdd}</h1>
      </div>

      <div className="bg-body border border-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-border">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === tb.key ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-body'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-muted mb-2 text-sm">{t.name} *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-muted mb-2 text-sm">{t.slug}</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-muted mb-2 text-sm">{t.status}</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none">
                    <option value="draft">{t.statusDraft}</option>
                    <option value="active">{t.statusActive}</option>
                    <option value="archived">{t.statusArchived}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-muted mb-2 text-sm">{t.shortDesc}</label>
                <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={2} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-muted mb-2 text-sm">{t.fullDesc}</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted mb-2 text-sm">{t.category}</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none">
                    <option value="">{t.selectCategory}</option>
                    {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-muted mb-2 text-sm">{t.productType}</label>
                  <select value={productType} onChange={(e) => setProductType(e.target.value as 'simple' | 'variable')} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none">
                    <option value="simple">{t.typeSimple}</option>
                    <option value="variable">{t.typeVariable}</option>
                  </select>
                </div>
              </div>
              {productType === 'simple' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted mb-2 text-sm">{t.price} *</label>
                    <input value={price} onChange={(e) => setPrice(formatPriceInput(e.target.value))} inputMode="numeric" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
                  </div>
                  <div>
                    <label className="block text-muted mb-2 text-sm">{t.stock}</label>
                    <input type="number" value={stock} min={0} onChange={(e) => setStock(e.target.value)} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-body focus:border-accent outline-none" />
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2 text-muted flex-row-reverse justify-start">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded bg-surface border-border" />
                {t.featured}
              </label>
            </div>
          )}

          {tab === 'variants' && (
            <VariantsTab
              attrTypes={attrTypes}
              selectedAxes={selectedAxes}
              setSelectedAxes={setSelectedAxes}
              variants={variants}
              setVariants={setVariants}
              onGenerate={generateVariants}
              t={t}
            />
          )}

          {tab === 'media' && (
            <MediaTab
              images={images}
              pendingFiles={pendingFiles}
              setPendingFiles={setPendingFiles}
              onSetMain={setMainImage}
              onDelete={deleteImage}
              t={t}
            />
          )}
        </div>

        <div className="border-t border-border p-4 flex items-center justify-end gap-3">
          <Link to="/admin/products" className="px-5 py-2.5 border border-border rounded-xl text-muted hover:text-body flex items-center gap-1">
            <X className="w-4 h-4" /> {common.cancel}
          </Link>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? '...' : editingId ? t.update : t.save}
          </button>
        </div>
      </div>
    </section>
  );
}

function VariantsTab({
  attrTypes,
  selectedAxes,
  setSelectedAxes,
  variants,
  setVariants,
  onGenerate,
  t,
}: {
  attrTypes: AttributeType[];
  selectedAxes: Record<string, number[]>;
  setSelectedAxes: React.Dispatch<React.SetStateAction<Record<string, number[]>>>;
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
  onGenerate: () => void;
  t: ReturnType<typeof useStoreConfig>['texts']['admin']['products'];
}) {
  const toggleValue = (slug: string, valId: number) => {
    setSelectedAxes((prev) => {
      const cur = prev[slug] || [];
      return { ...prev, [slug]: cur.includes(valId) ? cur.filter((v) => v !== valId) : [...cur, valId] };
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">{t.variantsHint}</p>
      <div className="space-y-3">
        {attrTypes.map((at) => {
          const slug = at.slug || at.type_slug || '';
          const values = at.values || [];
          if (!values.length) return null;
          return (
            <div key={slug} className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-medium text-body mb-2">{at.name || at.type_name}</p>
              <div className="flex flex-wrap gap-2">
                {values.map((v) => {
                  const selected = (selectedAxes[slug] || []).includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleValue(slug, v.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
                        selected ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted hover:text-body'
                      }`}
                    >
                      {v.swatch_hex && <span className="w-3 h-3 rounded-full" style={{ background: v.swatch_hex }} />}
                      {v.label || v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={onGenerate} className="px-4 py-2 bg-body border border-border rounded-xl text-sm font-medium hover:bg-card flex items-center gap-2">
        <Star className="w-4 h-4" /> {t.generateVariants}
      </button>

      <div className="border-t border-border pt-4">
        {variants.length === 0 ? (
          <p className="text-center text-dim py-8">{t.emptyVariants}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="admin-table-head">
              <tr>
                <th className="px-3 py-2 text-right text-xs text-muted">{t.variantTitle}</th>
                <th className="px-3 py-2 text-right text-xs text-muted">SKU</th>
                <th className="px-3 py-2 text-right text-xs text-muted">{t.price}</th>
                <th className="px-3 py-2 text-right text-xs text-muted">{t.stock}</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={v.id ?? i} className="border-t border-border">
                  <td className="px-3 py-2 text-body">{v.title}</td>
                  <td className="px-3 py-2"><input value={v.sku || ''} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)))} dir="ltr" className="bg-card border border-border rounded-lg px-2 py-1 text-xs w-28" /></td>
                  <td className="px-3 py-2"><input value={v.price || ''} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, price: parsePrice(e.target.value) } : x)))} inputMode="numeric" className="bg-card border border-border rounded-lg px-2 py-1 text-xs w-28" /></td>
                  <td className="px-3 py-2"><input type="number" value={v.inventory?.quantity ?? 0} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, inventory: { quantity: parseInt(e.target.value || '0', 10) || 0 } } : x)))} className="bg-card border border-border rounded-lg px-2 py-1 text-xs w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MediaTab({
  images,
  pendingFiles,
  setPendingFiles,
  onSetMain,
  onDelete,
  t,
}: {
  images: ImageVariant[];
  pendingFiles: File[];
  setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onSetMain: (id: number) => void;
  onDelete: (id: number) => void;
  t: ReturnType<typeof useStoreConfig>['texts']['admin']['products'];
}) {
  const imgUrl = (i: ImageVariant) => i.url || i.image_url || i.image_thumb_url || i.urls?.thumb || i.image_medium_url || i.urls?.medium || '';
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-muted mb-2 text-sm">{t.addImage}</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPendingFiles((f) => [...f, ...Array.from(e.target.files || [])])}
          className="block w-full text-sm text-muted file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white file:cursor-pointer"
        />
      </div>
      {pendingFiles.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {pendingFiles.map((f, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface">
              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">در انتظار</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {images.map((img) => (
          <div key={img.id} className={`relative aspect-square rounded-xl overflow-hidden bg-surface border-2 ${img.is_main ? 'border-accent' : 'border-transparent'}`}>
            <ImageWithFallback src={imgUrl(img)} alt={img.alt_text || ''} iconClassName="w-5 h-5" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 hover:opacity-100">
              {!img.is_main && (
                <button onClick={() => img.id && onSetMain(img.id)} className="bg-white/90 text-body text-[10px] px-2 py-1 rounded" title={t.mainImage}>
                  {t.mainImage}
                </button>
              )}
              {img.id && (
                <button onClick={() => { if (img.id) onDelete(img.id); }} className="bg-white/90 text-accent p-1 rounded" title="حذف">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {img.is_main && <span className="absolute top-1 right-1 text-[9px] bg-accent text-white px-1.5 py-0.5 rounded">{t.mainImage}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminProductEditorPage;
