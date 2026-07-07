import { cfg } from '../config/bootstrap';
import type { User } from '../types';

function keys() {
  const s = cfg().storage || { role: 'nad_role', user: 'nad_user', token: 'nad_token', refreshToken: 'nad_refresh', guestCart: 'nad_guest_cart' };
  return {
    role: s.role || 'nad_role',
    user: s.user || 'nad_user',
    token: s.token || 'nad_token',
    refreshToken: s.refreshToken || 'nad_refresh',
  };
}

export const token = {
  get: () => null,
  set: () => {},
  remove: () => {},
};

export const refreshToken = {
  get: () => null,
  set: () => {},
  remove: () => {},
};

export const role = {
  get: () => localStorage.getItem(keys().role),
  set: (r: string) => localStorage.setItem(keys().role, r),
  remove: () => localStorage.removeItem(keys().role),
  isAdmin: () => localStorage.getItem(keys().role) === 'admin',
};

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(keys().user);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(keys().user, JSON.stringify(user));
  } else {
    localStorage.removeItem(keys().user);
  }
}

export function isLoggedIn(): boolean {
  return !!getCurrentUser();
}

export interface SessionData {
  user?: User;
  role?: string;
  [key: string]: unknown;
}

export function persistSession(data: SessionData | null): SessionData | null {
  if (!data || typeof data !== 'object') return data;
  const user = data.user;
  const userRole = user?.role ?? data.role ?? 'user';
  role.set(userRole);
  if (user) setCurrentUser(user);
  return data;
}

export function clearSession(): void {
  role.remove();
  setCurrentUser(null);
  localStorage.removeItem(keys().token);
  localStorage.removeItem(keys().refreshToken);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

const auth = {
  token,
  refreshToken,
  role,
  getCurrentUser,
  setCurrentUser,
  isLoggedIn,
  persistSession,
  clearSession,
};

export default auth;
