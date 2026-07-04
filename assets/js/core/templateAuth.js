/**
 * core/templateAuth.js — ورود ادمین نمایشی تمپلیت (بدون بک‌اند)
 */
import { storeConfig } from '../config/bootstrap.js';
import * as auth from './auth.js';

const TEMPLATE_ADMIN_ID = 'template-admin';

export function isTemplateAuthEnabled() {
  const creds = storeConfig.auth?.templateAdmin;
  return !!window.AppConfig?.demoMode
    && !!creds?.username
    && !!creds?.password;
}

export function matchTemplateAdminCredentials(loginId, password) {
  if (!isTemplateAuthEnabled()) return false;
  const { username, password: expected } = storeConfig.auth.templateAdmin;
  return loginId === username && password === expected;
}

export function createTemplateAdminSession() {
  const { username, displayName } = storeConfig.auth.templateAdmin;
  return {
    user: {
      id: TEMPLATE_ADMIN_ID,
      name: displayName || 'مدیر فروشگاه',
      phone: username,
      role: 'admin',
    },
  };
}

export function isTemplateAdminSession() {
  if (!isTemplateAuthEnabled()) return false;
  const user = auth.getCurrentUser();
  return user?.id === TEMPLATE_ADMIN_ID && auth.role.isAdmin();
}
