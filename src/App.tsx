import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { initConfig } from './config/bootstrap';
import { initTheme } from './core/theme';
import loadStoreSettings from './core/storeSettings';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastViewport } from './components/ToastViewport';
import { StorefrontLayout } from './components/StorefrontLayout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentPage } from './pages/PaymentPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { LegalPage } from './pages/LegalPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { AdminLayout } from './admin/AdminLayout';
import { DashboardPage } from './admin/DashboardPage';
import { AdminProductsPage } from './admin/AdminProductsPage';
import { AdminProductEditorPage } from './admin/AdminProductEditorPage';
import { AdminCategoriesPage } from './admin/AdminCategoriesPage';
import { AdminOrdersPage } from './admin/AdminOrdersPage';
import { AdminUsersPage } from './admin/AdminUsersPage';
import { AdminDiscountsPage } from './admin/AdminDiscountsPage';
import { AdminBannersPage } from './admin/AdminBannersPage';
import { AdminPagesPage } from './admin/AdminPagesPage';
import { AdminSettingsPage } from './admin/AdminSettingsPage';

initConfig();

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      initTheme();
      try {
        await loadStoreSettings();
        initTheme();
      } catch {
        /* fallback config already in place */
      }
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-muted">
        <div className="text-4xl animate-pulse">✦</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/category/:slug" element={<ShopPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/product/:id/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/:id"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<LegalPage page="about" />} />
              <Route path="/contact" element={<LegalPage page="contact" />} />
              <Route path="/terms" element={<LegalPage page="terms" />} />
              <Route path="/privacy" element={<LegalPage page="privacy" />} />
              <Route path="/refund" element={<LegalPage page="refund" />} />
              <Route path="/faq" element={<LegalPage page="faq" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductEditorPage />} />
              <Route path="products/:id" element={<AdminProductEditorPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="discounts" element={<AdminDiscountsPage />} />
              <Route path="banners" element={<AdminBannersPage />} />
              <Route path="pages" element={<AdminPagesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastViewport />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
