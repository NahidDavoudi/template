import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Copy } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { formatPrice } from '../lib/utils/priceFormatter';
import { toast } from '../lib/utils/toast';

interface CheckoutStore {
  id?: number;
  order_id?: number;
  order_number?: string;
  total?: number;
  total_amount?: number;
}

export function PaymentPage() {
  const cfg = useStoreConfig();
  const navigate = useNavigate();
  usePageTitle(`پرداخت | ${cfg.name}`);

  const [order, setOrder] = useState<CheckoutStore>({});
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      setOrder(JSON.parse(sessionStorage.getItem('nad_checkout') || '{}'));
    } catch {
      setOrder({});
    }
  }, []);

  const orderId = order.id || order.order_id;
  const total = order.total_amount || order.total;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('حجم فایل بیش از ۵ مگابایت است');
      return;
    }
    setFile(f);
    setError('');
  };

  const submit = async () => {
    if (!file) {
      setError('لطفاً تصویر رسید را انتخاب کنید');
      return;
    }
    if (!orderId) {
      setError('شماره سفارش نامعتبر است');
      return;
    }
    setSubmitting(true);
    try {
      await api.orders.uploadReceipt(orderId, file);
      sessionStorage.removeItem('nad_checkout');
      toast('رسید با موفقیت ثبت شد. سفارش شما در دست بررسی است.', 'success', 4000);
      setTimeout(() => navigate('/'), 2000);
    } catch (e) {
      setError((e as Error).message || 'خطا در ارسال رسید');
      setSubmitting(false);
    }
  };

  const copyCard = () => {
    navigator.clipboard.writeText(cfg.payment.cardNumber).then(() => toast('کپی شد', 'success', 1500)).catch(() => toast('متن کپی نشد!', 'error'));
  };

  return (
    <main className="max-w-[800px] mx-auto px-4 md:px-10 py-12">
      <h1 className="text-3xl font-bold text-right mb-8">پرداخت سفارش</h1>

      <div className="bg-card border border-border rounded-xl p-6 mb-6 text-right">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold">{total ? formatPrice(total) : '—'}</span>
          <span className="text-muted text-sm">مبلغ قابل پرداخت</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">{order.order_number || '-'}</span>
          <span className="text-muted text-sm">شماره سفارش</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6 text-right">
        <p className="text-sm text-muted mb-4">برای پرداخت کارت به کارت، مبلغ بالا را به شماره کارت زیر واریز کرده و تصویر رسید را بارگذاری کنید.</p>
        <div className="flex items-center justify-between bg-surface rounded-lg p-4 mb-2">
          <span id="payment-card-number" className="font-bold tracking-wider" dir="ltr">{cfg.payment.cardNumber || cfg.payment.unavailableMessage || '—'}</span>
          <span className="text-xs text-muted">شماره کارت</span>
        </div>
        <div className="flex items-center justify-between bg-surface rounded-lg p-4">
          <span id="payment-card-owner" dir="ltr">{cfg.payment.cardOwner || '—'}</span>
          <span className="text-xs text-muted">نام صاحب کارت</span>
        </div>
        <button onClick={copyCard} className="mt-4 inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          <Copy className="w-4 h-4" /> کپی شماره کارت
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <label className="block">
          <span className="block text-sm font-medium text-body mb-3 text-right">تصویر رسید</span>
          <input type="file" accept="image/*" onChange={onFile} className="hidden" id="receipt-input" />
          <label htmlFor="receipt-input" className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-10 cursor-pointer hover:border-accent transition-colors text-muted">
            <Upload className="w-8 h-8 mb-2" />
            {file ? <span className="text-sm text-body">{file.name}</span> : <span className="text-sm">برای انتخاب فایل کلیک کنید (حداکثر ۵ مگابایت)</span>}
          </label>
        </label>
        {error && <p className="text-sm text-accent text-right mt-3">{error}</p>}
      </div>

      <button onClick={submit} disabled={submitting} className="w-full py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover shadow disabled:opacity-50">
        {submitting ? 'در حال ارسال...' : 'ارسال رسید'}
      </button>
      <Link to="/" className="block text-center text-muted text-sm mt-4 hover:text-accent">← بازگشت به فروشگاه</Link>
    </main>
  );
}

export default PaymentPage;
