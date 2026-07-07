import { useCallback, useEffect, useState } from 'react';
import { Package, ShoppingBag, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { AdminHeader, StatCard, AdminCard, EmptyState } from './ui';
import { formatPrice } from '../lib/utils/priceFormatter';
import { toast } from '../lib/utils/toast';

interface RawStats {
  total_products?: number;
  products?: number;
  today_orders?: number;
  ordersToday?: number;
  low_stock_items?: number;
  lowStock?: number;
  pending_orders?: number;
  pending?: number;
  total_orders?: number;
  totalOrders?: number;
  total_revenue?: number;
  totalRevenue?: number;
  total_users?: number;
  totalUsers?: number;
  weekly_revenue?: { date?: string; day?: string; amount?: number; revenue?: number; total?: number }[];
  order_status?: Record<string, number>;
  [key: string]: unknown;
}

const DONUT_COLORS = ['#000', '#333', '#1d4ed8', '#7c3aed', '#15803d', '#86868b'];

export function DashboardPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.dashboard as unknown as {
    title: string; subtitle: string; refresh: string; weeklyRevenue: string;
    orderStatus: string; financialSummary: string; noSales: string; noData: string; ordersLabel: string;
    stats: Record<string, string>;
  };
  const [stats, setStats] = useState<RawStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await api.dashboard.stats()) as RawStats | { data?: RawStats };
      setStats((res && typeof res === 'object' && 'data' in res ? (res.data as RawStats) : (res as RawStats)) || null);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const weekly = (stats?.weekly_revenue as RawStats['weekly_revenue']) || [];
  const orderStatus = (stats?.order_status as Record<string, number>) || {};

  return (
    <section>
      <AdminHeader
        title={t.title}
        subtitle={t.subtitle}
        action={
          <button onClick={load} className="bg-body border border-border text-muted px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 hover:bg-card">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.refresh}</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard icon={Package} value={(stats?.total_products ?? stats?.products ?? 0).toLocaleString('fa-IR')} label={t.stats.products} />
        <StatCard icon={ShoppingBag} value={(stats?.today_orders ?? stats?.ordersToday ?? 0).toLocaleString('fa-IR')} label={t.stats.ordersToday} />
        <StatCard icon={AlertTriangle} tone="amber" value={(stats?.low_stock_items ?? stats?.lowStock ?? 0).toLocaleString('fa-IR')} label={t.stats.lowStock} />
        <StatCard icon={Clock} value={(stats?.pending_orders ?? stats?.pending ?? 0).toLocaleString('fa-IR')} label={t.stats.pending} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AdminCard className="lg:col-span-2">
          <h3 className="text-body font-bold text-lg mb-6">{t.weeklyRevenue}</h3>
          <WeeklyChart data={weekly} noSales={t.noSales} loading={loading} />
        </AdminCard>
        <AdminCard>
          <h3 className="text-body font-bold text-lg mb-4">{t.orderStatus}</h3>
          <OrderStatusDonut data={orderStatus} noData={t.noData} ordersLabel={t.ordersLabel} loading={loading} />
        </AdminCard>
      </div>

      <AdminCard>
        <h3 className="text-body font-bold text-lg mb-4">{t.financialSummary}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4">
            <div className="text-muted text-sm mb-1">{t.stats.totalOrders}</div>
            <div className="text-2xl font-bold text-body">{(stats?.total_orders ?? stats?.totalOrders ?? 0).toLocaleString('fa-IR')}</div>
          </div>
          <div className="bg-card rounded-xl p-4">
            <div className="text-muted text-sm mb-1">{t.stats.totalRevenue}</div>
            <div className="text-2xl font-bold text-emerald-600">{formatPrice(stats?.total_revenue ?? stats?.totalRevenue ?? 0)}</div>
          </div>
          <div className="bg-card rounded-xl p-4">
            <div className="text-muted text-sm mb-1">{t.stats.totalUsers}</div>
            <div className="text-2xl font-bold text-body">{(stats?.total_users ?? stats?.totalUsers ?? 0).toLocaleString('fa-IR')}</div>
          </div>
        </div>
      </AdminCard>
    </section>
  );
}

function WeeklyChart({ data, noSales, loading }: { data: { date?: string; day?: string; amount?: number; revenue?: number; total?: number }[]; noSales: string; loading: boolean }) {
  type RawPoint = { date?: string; day?: string; amount?: number; revenue?: number; total?: number };
  const points = (data && data.length
    ? (data as RawPoint[])
    : Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        return { date: `${d.getMonth() + 1}/${d.getDate()}`, amount: 0 } as RawPoint;
      })
  ).map((d) => ({ date: d.date || d.day || '', amount: Number(d.amount ?? d.revenue ?? d.total ?? 0) }));

  if (loading) return <div className="h-72 flex items-center justify-center text-dim">در حال بارگذاری...</div>;
  if (points.every((d) => d.amount === 0)) return <EmptyState text={noSales} />;

  const max = Math.max(...points.map((d) => d.amount), 1);
  return (
    <div className="h-72 flex items-end gap-3 px-2">
      {points.map((d, i) => {
        const pct = Math.max(2, Math.round((d.amount / max) * 100));
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
            <div className="w-full flex-1 flex items-end" title={`${d.amount.toLocaleString('fa-IR')} تومان`}>
              <div className="w-full rounded-t-md bg-gradient-to-t from-accent-hover to-accent" style={{ height: `${pct}%`, minHeight: 4 }} />
            </div>
            <div className="text-[10px] text-muted">{d.date}</div>
          </div>
        );
      })}
    </div>
  );
}

function OrderStatusDonut({ data, noData, ordersLabel, loading }: { data: Record<string, number>; noData: string; ordersLabel: string; loading: boolean }) {
  const entries = Object.entries(data || {}).filter(([, v]) => v > 0);
  if (loading) return <div className="text-center py-20 text-dim">در حال بارگذاری...</div>;
  if (!entries.length) return <EmptyState text={noData} />;

  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  let deg = 0;
  const gradient = entries
    .map(([, v], i) => {
      const slice = (v / total) * 360;
      const part = `${DONUT_COLORS[i % DONUT_COLORS.length]} ${deg}deg ${deg + slice}deg`;
      deg += slice;
      return part;
    })
    .join(', ');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <div className="w-40 h-40 rounded-full relative" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="absolute inset-7 bg-body rounded-full flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-body">{total.toLocaleString('fa-IR')}</span>
            <span className="text-[11px] text-muted">{ordersLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {entries.map(([label, val], i) => {
          const pct = Math.round((val / total) * 100);
          const color = DONUT_COLORS[i % DONUT_COLORS.length];
          return (
            <div key={label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-xs text-muted">{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-body">{val.toLocaleString('fa-IR')}</span>
                <span className="text-[11px] text-muted">({pct.toLocaleString('fa-IR')}٪)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardPage;
