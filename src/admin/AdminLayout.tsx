import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  PieChart, Package, Tags, ShoppingCart, Users, Percent,
  Images, Settings, FileText, LogOut, Store, Menu, X,
} from 'lucide-react';
import { useStoreConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { pickVariantSet } from '../lib/utils/imageUrl';

interface NavItem {
  to: string;
  end?: boolean;
  icon: typeof PieChart;
  key: 'dashboard' | 'products' | 'categories' | 'orders' | 'users' | 'discounts' | 'promoBanners' | 'settings' | 'pages';
}

const NAV: NavItem[] = [
  { to: '/admin', end: true, icon: PieChart, key: 'dashboard' },
  { to: '/admin/products', icon: Package, key: 'products' },
  { to: '/admin/categories', icon: Tags, key: 'categories' },
  { to: '/admin/orders', icon: ShoppingCart, key: 'orders' },
  { to: '/admin/users', icon: Users, key: 'users' },
  { to: '/admin/discounts', icon: Percent, key: 'discounts' },
  { to: '/admin/banners', icon: Images, key: 'promoBanners' },
  { to: '/admin/settings', icon: Settings, key: 'settings' },
  { to: '/admin/pages', icon: FileText, key: 'pages' },
];

export function AdminLayout() {
  const cfg = useStoreConfig();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  usePageTitle(`${cfg.texts.admin.title} | ${cfg.name}`);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const logoSrc = pickVariantSet(cfg.logoVariants, 'thumb') || cfg.logo;
  const username = user?.name || user?.phone || cfg.texts.admin.panelLabel;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
      isActive ? 'bg-accent/10 text-accent font-bold' : 'text-muted hover:bg-surface hover:text-body'
    }`;

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <header className="lg:hidden fixed top-0 right-0 left-0 z-30 bg-body/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="text-muted hover:text-body p-2 rounded-lg hover:bg-surface">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-body text-lg">{cfg.texts.admin.title}</h1>
        <div className="w-9 h-9" />
      </header>

      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-body border-l border-border transform transition-transform duration-300 flex flex-col shadow-2xl lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              {logoSrc ? (
                <img src={logoSrc} alt={cfg.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="text-white w-7 h-7" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg text-body">{cfg.name}</h2>
              <p className="text-sm text-muted">{username}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {NAV.map(({ to, end, icon: Icon, key }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
              <Icon className="w-5 h-5" />
              <span>{cfg.texts.admin.nav[key]}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted bg-surface hover:text-body transition-colors text-sm">
            <Store className="w-5 h-5" />
            <span>مشاهده سایت</span>
          </NavLink>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-accent hover:bg-accent/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">{cfg.texts.admin.logout}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 mt-16 lg:mt-0 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
