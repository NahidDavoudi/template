import { cfg } from '../config/bootstrap';
import { storeConfig } from '../config/bootstrap';
import auth from './auth';

const TEMPLATE_ADMIN_ID = 'template-admin';

export function isTemplateAuthEnabled(): boolean {
  const creds = storeConfig.auth?.templateAdmin;
  return !!cfg().demoMode && !!creds?.username && !!creds?.password;
}

export function matchTemplateAdminCredentials(loginId: string, password: string): boolean {
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
      role: 'admin' as const,
    },
  };
}

export function isTemplateAdminSession(): boolean {
  if (!isTemplateAuthEnabled()) return false;
  const user = auth.getCurrentUser();
  return user?.id === TEMPLATE_ADMIN_ID && auth.role.isAdmin();
}
