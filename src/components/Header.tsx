import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User } from 'lucide-react';
import { useStoreConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { pickVariantSet } from '../lib/utils/imageUrl';

export function Header() {
  const cfg = useStoreConfig();
  const { user, isLoggedIn, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const logoSrc = pickVariantSet(cfg.logoVariants, 'thumb') || cfg.logo;
  const navLinks = cfg.texts.nav;
  const path = location.pathname;

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-body/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0 flex items-center gap-2.5">
          <img src={logoSrc} alt={cfg.name} className="h-9 w-9 object-contain" />
          <span className="font-display text-xl md:text-2xl text-body tracking-[0.15em] font-bold hidden md:inline" dir="ltr">
            {cfg.name}
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const active = l.href === path || (l.href !== '/' && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                to={l.href}
                className={`text-sm transition-colors px-2 py-1 rounded-full hover:bg-accent/10 header-nav-link ${
                  active ? 'text-body font-bold' : 'text-dim hover:text-body'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-accent/10 transition-colors" title="جستجو" aria-label="جستجو">
            <Search className="w-[18px] h-[18px] text-muted" />
          </button>
          <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent/10 transition-colors group" aria-label="سبد خرید">
            <ShoppingBag className="w-[18px] h-[18px] text-muted group-hover:text-body transition-colors" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {count > 99 ? '۹۹+' : count.toLocaleString('fa-IR')}
              </span>
            )}
          </Link>
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs text-muted hidden sm:inline">{user?.name || user?.phone || ''}</span>
              <button onClick={onLogout} className="text-xs text-muted hover:text-body transition-colors">خروج</button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-accent/10 transition-colors" title="ورود" aria-label="ورود">
              <User className="w-[18px] h-[18px] text-muted" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
