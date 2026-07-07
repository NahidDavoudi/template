import { Link, useLocation } from 'react-router-dom';
import { Home, Store, LayoutGrid, User } from 'lucide-react';
import { useStoreConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';

const ICONS: Record<string, typeof Home> = {
  home: Home,
  store: Store,
  'layout-grid': LayoutGrid,
  user: User,
};

export function MobileBottomNav() {
  const cfg = useStoreConfig();
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const items = cfg.texts.mobileBottomNav;
  const path = location.pathname;

  const resolveTo = (item: { id?: string; href?: string }) =>
    item.id === 'profile' ? (isLoggedIn ? '/profile' : '/login') : (item.href || '/');

  const isActive = (item: { id?: string; routes: string[] }) => {
    if (item.id === 'profile') return isLoggedIn && (path === '/profile' || path === '/orders');
    return (item.routes || []).some((r) => r === path || (path === '/' && r === ''));
  };

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label="ناوبری اصلی">
      <div className="mobile-bottom-nav__inner flex items-stretch max-w-[1280px] mx-auto">
        {items.map((item) => {
          const Icon = ICONS[item.icon] || User;
          const active = isActive(item);
          return (
            <Link
              key={item.id || item.href}
              to={resolveTo(item)}
              className={`mobile-bottom-nav__item flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1.5 transition-all duration-200 ${
                active ? 'is-active text-accent' : 'text-muted'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-full px-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
