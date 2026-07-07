import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { formatPrice, formatDate } from '../lib/utils/priceFormatter';
import { useStoreConfig } from '../context/ConfigContext';

export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-body">{title}</h1>
        {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, value, label, tone = 'accent' }: { icon: LucideIcon; value: ReactNode; label: string; tone?: 'accent' | 'amber' }) {
  const wrap = tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-accent/10 text-accent';
  return (
    <div className="bg-body border border-border rounded-2xl p-5 hover:border-accent/30 transition-all shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wrap}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="text-3xl font-bold text-body mb-1">{value}</div>
      <div className="text-muted text-sm">{label}</div>
    </div>
  );
}

export function AdminCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-body border border-border rounded-2xl p-6 shadow-lg ${className}`}>{children}</div>;
}

export function EmptyState({ text }: { text: string }) {
  return <div className="text-center py-20 text-dim">{text}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = useStoreConfig();
  const map = cfg.texts.admin.orderStatuses as Record<string, { label: string; cls: string }>;
  const s = map[status] || { label: status, cls: 'bg-card text-muted' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export function Price({ value }: { value: number | string | null | undefined }) {
  return <>{formatPrice(value as number | null | undefined)}</>;
}

export function DateCell({ value }: { value: string | null | undefined }) {
  return <>{formatDate(value)}</>;
}

export function ConfirmDelete({ onConfirm, message }: { onConfirm: () => void; message: string }) {
  if (!confirm(message)) return;
  onConfirm();
}
