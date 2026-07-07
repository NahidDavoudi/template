import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

export function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 page-fade">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <ScrollRestoration />
    </div>
  );
}

export default StorefrontLayout;
