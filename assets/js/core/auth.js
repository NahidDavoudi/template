/**
 * core/auth.js — session state (tokens live in HttpOnly cookies only)
 */

function keys() {
  const s = window.AppConfig?.storage || {};
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
  set: (r) => localStorage.setItem(keys().role, r),
  remove: () => localStorage.removeItem(keys().role),
  isAdmin: () => localStorage.getItem(keys().role) === 'admin',
};

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(keys().user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(keys().user, JSON.stringify(user));
  } else {
    localStorage.removeItem(keys().user);
  }
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

export function persistSession(data) {
  if (!data || typeof data !== 'object') return data;

  const user = data.user;
  const userRole = user?.role ?? data.role ?? 'user';

  role.set(userRole);
  if (user) setCurrentUser(user);

  return data;
}

export function clearSession() {
  role.remove();
  setCurrentUser(null);
  localStorage.removeItem(keys().token);
  localStorage.removeItem(keys().refreshToken);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export default {
  token,
  refreshToken,
  role,
  getCurrentUser,
  setCurrentUser,
  isLoggedIn,
  persistSession,
  clearSession,
};
