import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import api from '../core/api';
import auth from '../core/auth';
import events from '../core/events';
import { isTemplateAdminSession } from '../core/templateAuth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  ready: boolean;
  login: (phone: string, password: string) => Promise<void>;
  adminLogin: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => auth.getCurrentUser());
  const [ready, setReady] = useState(false);

  const sync = useCallback(() => {
    setUser(auth.getCurrentUser());
  }, []);

  useEffect(() => {
    const off1 = events.on('auth:changed', sync);
    const off2 = events.on('cart:updated', sync);
    return () => {
      off1();
      off2();
    };
  }, [sync]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await api.auth.validateSession();
      if (mounted) {
        sync();
        setReady(true);
        if (api.auth.isLoggedIn()) {
          api.cart.mergeGuestIfNeeded().catch(() => {});
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sync]);

  const login = useCallback(async (phone: string, password: string) => {
    await api.auth.login(phone, password);
    sync();
    events.emit('cart:updated');
  }, [sync]);

  const adminLogin = useCallback(async (phone: string, password: string) => {
    await api.auth.adminLogin(phone, password);
    sync();
  }, [sync]);

  const logout = useCallback(async () => {
    await api.auth.logout();
    sync();
    events.emit('cart:updated');
  }, [sync]);

  const refresh = useCallback(async () => {
    sync();
  }, [sync]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: !!user,
      isAdmin: isTemplateAdminSession() || auth.role.isAdmin(),
      ready,
      login,
      adminLogin,
      logout,
      refresh,
    }),
    [user, ready, login, adminLogin, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
