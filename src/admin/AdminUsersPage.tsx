import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { AdminHeader, EmptyState } from './ui';
import { formatDate } from '../lib/utils/priceFormatter';
import { toast } from '../lib/utils/toast';
import type { User } from '../types';

export function AdminUsersPage() {
  const cfg = useStoreConfig();
  const t = cfg.texts.admin.users;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = (await api.users.list()) as User[] | { data?: User[] };
      setUsers(Array.isArray(data) ? data : data?.data ?? []);
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
    if (!q) return users;
    return users.filter((u) => (u.name || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q));
  }, [users, search]);

  const toggleRole = async (u: User) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`تغییر نقش به "${newRole === 'admin' ? t.roleAdmin : t.roleUser}"؟`)) return;
    try {
      await api.users.updateRole(Number(u.id), newRole);
      toast('نقش کاربر تغییر کرد');
      setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const remove = async (u: User) => {
    if (!confirm(`حذف کاربر "${u.name || u.phone}"؟`)) return;
    try {
      await api.users.delete(Number(u.id));
      toast('کاربر حذف شد');
      setUsers((us) => us.filter((x) => x.id !== u.id));
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  return (
    <section>
      <AdminHeader title={t.title} subtitle={t.subtitle} />

      <div className="bg-body border border-border rounded-2xl p-5 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی کاربر..." className="bg-card border border-border rounded-xl px-4 py-3 text-body placeholder:text-dim focus:border-accent outline-none w-full sm:max-w-sm" />
      </div>

      <div className="bg-body border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="admin-table-head">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">کاربر</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">تلفن</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">نقش</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">تاریخ</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-dim">{cfg.texts.admin.loading}</td></tr>
            ) : !filtered.length ? (
              <tr><td colSpan={5}><EmptyState text={t.empty} /></td></tr>
            ) : (
              filtered.map((u) => {
                const isAdmin = u.role === 'admin';
                const date = (u as { created_at?: string }).created_at;
                return (
                  <tr key={String(u.id)} className="hover:bg-row transition-colors border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                          {(u.name || u.phone || '؟').charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-body">{u.name || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted" dir="ltr">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isAdmin ? 'bg-accent/10 text-accent' : 'bg-card text-muted'}`}>
                        {isAdmin ? t.roleAdmin : t.roleUser}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-dim">{formatDate(date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => toggleRole(u)} title={isAdmin ? t.roleUser : t.roleAdmin} className="w-8 h-8 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors text-sm">
                          {isAdmin ? '↓' : '↑'}
                        </button>
                        <button onClick={() => remove(u)} className="p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors">
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

export default AdminUsersPage;
