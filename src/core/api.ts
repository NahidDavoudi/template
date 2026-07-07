import auth, { type SessionData } from './auth';
import { createCartStore } from './cartStore';
import { formatPrice, parsePrice } from '../lib/utils/priceFormatter';
import { cfg } from '../config/bootstrap';
import {
  isDemoMode,
  demoProductList,
  demoProductGet,
  demoCategoriesList,
  demoCategoryBySlug,
  demoOrderCreate,
} from './demoApi';
import {
  matchTemplateAdminCredentials,
  createTemplateAdminSession,
  isTemplateAdminSession,
  isTemplateAuthEnabled,
} from './templateAuth';
import { toast } from '../lib/utils/toast';
import type {
  Product,
  Category,
  ProductListFilters,
  ProductListResponse,
  Order,
  OrderItemInput,
  Address,
  User,
  Discount,
  PromoBanner,
  DashboardStats,
  StatusCount,
} from '../types';

const API = () => cfg().api;
const MSG = () => cfg().messages;
const HOOKS = () => cfg().hooks;
const BASE_URL = () => API().baseUrl || 'api/v1';

export interface ApiErrorOptions {
  errors?: Record<string, string[]> | null;
  raw?: unknown;
  isNetwork?: boolean;
  isTimeout?: boolean;
  isParse?: boolean;
}

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]> | null;
  raw: unknown;
  isNetwork: boolean;
  isTimeout: boolean;
  isParse: boolean;

  constructor(message: string, status = 0, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = options.errors ?? null;
    this.raw = options.raw ?? null;
    this.isNetwork = !!options.isNetwork;
    this.isTimeout = !!options.isTimeout;
    this.isParse = !!options.isParse;
  }

  get isValidation() { return this.status === 422; }
  get isAuth() { return this.status === 401; }
  get isForbidden() { return this.status === 403; }
  get isNotFound() { return this.status === 404; }
  get isRateLimit() { return this.status === 429; }
  get isServer() { return this.status >= 500; }

  firstFieldError(): string | null {
    if (!this.errors || typeof this.errors !== 'object') return null;
    return Object.values(this.errors).flat()[0] ?? null;
  }

  displayMessage(): string {
    return this.firstFieldError() || this.message || MSG().unknown;
  }
}

interface MappedResponse<T> {
  ok: boolean;
  data: T | null;
  message: string;
  errors: Record<string, string[]> | null;
  meta: unknown;
  status: number;
}

function mapResponse<T>(json: T, status: number): MappedResponse<T> {
  if (json && typeof json === 'object' && 'success' in json) {
    const j = json as Record<string, unknown>;
    return {
      ok: !!j.success,
      data: (j.data as T) ?? null,
      message: (j.message as string) ?? '',
      errors: (j.errors as Record<string, string[]>) ?? null,
      meta: j.meta ?? null,
      status,
    };
  }
  return { ok: status >= 200 && status < 300, data: json, message: '', errors: null, meta: null, status };
}

function defaultMessage(status: number): string {
  const m = MSG();
  if (status === 401) return m.unauthorized;
  if (status === 403) return m.forbidden;
  if (status === 404) return m.notFound;
  if (status === 422) return m.validation;
  if (status === 429) return m.rateLimit;
  if (status >= 500) return m.server;
  return m.unknown;
}

function emitError(err: unknown): void {
  const onError = HOOKS().onError;
  if (typeof onError === 'function') {
    try { onError(err); } catch { /* noop */ }
  }
}

function emitUnauthorized(): void {
  const onUnauthorized = HOOKS().onUnauthorized;
  if (typeof onUnauthorized === 'function') {
    try { onUnauthorized(); } catch { /* noop */ }
  }
}

function buildUrl(path: string, queryParams: Record<string, unknown> = {}): string {
  const base = BASE_URL().replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const pageBase = window.location.href.replace(/[#?].*$/, '').replace(/[^/]+$/, '');
  const relative = base.startsWith('/') ? `${base.slice(1)}${cleanPath}` : `${base}${cleanPath}`;
  const url = new URL(relative, pageBase);
  Object.entries(queryParams).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, String(v));
  });
  return url.toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(MSG().parse || 'پاسخ سرور قابل پردازش نیست.', res.status, { isParse: true });
  }
}

interface RequestOptions {
  retries?: number;
  skipRefresh?: boolean;
  full?: boolean;
  [key: string]: unknown;
}

async function _tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return false;
    const json = await parseJsonSafe(res);
    const mapped = mapResponse(json, res.status);
    if (!mapped.ok) return false;
    auth.persistSession(mapped.data as SessionData);
    return true;
  } catch {
    return false;
  }
}

async function request<T = unknown>(
  method: string,
  path: string,
  body: BodyInit | Record<string, unknown> | null = null,
  queryParams: Record<string, unknown> = {},
  options: RequestOptions = {},
): Promise<T> {
  const retries = options.retries ?? API().retries ?? 0;
  let attempt = 0;
  while (true) {
    try {
      return await _requestOnce<T>(method, path, body, queryParams, options);
    } catch (err) {
      const retryable = err instanceof ApiError && (err.isNetwork || err.isServer || err.isTimeout);
      if (!retryable || attempt >= retries) throw err;
      attempt++;
      await sleep(API().retryDelay ?? 600);
    }
  }
}

async function _requestOnce<T>(
  method: string,
  path: string,
  body: BodyInit | Record<string, unknown> | null,
  queryParams: Record<string, unknown>,
  options: RequestOptions,
): Promise<T> {
  const url = buildUrl(path, queryParams);
  const headers: Record<string, string> = { Accept: 'application/json' };
  const isFormData = body instanceof FormData;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API().timeout ?? 30000);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      body: body ? (isFormData ? body : JSON.stringify(body)) : null,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const e = err as Error;
    if (e.name === 'AbortError') {
      const apiErr = new ApiError(MSG().timeout || 'زمان درخواست به پایان رسید.', 0, { isTimeout: true });
      emitError(apiErr);
      throw apiErr;
    }
    const apiErr = new ApiError(MSG().network || 'خطا در اتصال به سرور.', 0, { isNetwork: true });
    emitError(apiErr);
    throw apiErr;
  } finally {
    clearTimeout(timer);
  }

  if (
    res.status === 401 &&
    API().autoRefresh !== false &&
    !options.skipRefresh &&
    !path.includes('/auth/login') &&
    !path.includes('/auth/otp/')
  ) {
    const refreshed = await _tryRefresh();
    if (refreshed) {
      return _requestOnce<T>(method, path, body, queryParams, { ...options, skipRefresh: true });
    }
    auth.clearSession();
    emitUnauthorized();
  }

  if (res.status === 204) {
    const empty = mapResponse(null, 204) as MappedResponse<T>;
    return (options.full ? empty : (null as unknown)) as T;
  }

  const json = await parseJsonSafe(res);
  const mapped = mapResponse<T>(json as T, res.status);

  if (!res.ok || !mapped.ok) {
    const err = new ApiError(mapped.message || defaultMessage(res.status), res.status, {
      errors: mapped.errors,
      raw: json,
    });
    emitError(err);
    throw err;
  }

  return (options.full ? mapped : mapped.data) as T;
}

async function withFallback<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof ApiError && (err.isNetwork || err.isServer || err.isTimeout || err.isNotFound)) {
      return fallback;
    }
    throw err;
  }
}

const get = <T = unknown>(path: string, q?: Record<string, unknown>, opts?: RequestOptions) =>
  request<T>('GET', path, null, q, opts);
const post = <T = unknown>(path: string, body?: BodyInit | Record<string, unknown>, opts?: RequestOptions) =>
  request<T>('POST', path, body ?? null, {}, opts);
const put = <T = unknown>(path: string, body?: BodyInit | Record<string, unknown>, opts?: RequestOptions) =>
  request<T>('PUT', path, body ?? null, {}, opts);
const patch = <T = unknown>(path: string, body?: BodyInit | Record<string, unknown>, opts?: RequestOptions) =>
  request<T>('PATCH', path, body ?? null, {}, opts);
const del = <T = unknown>(path: string, opts?: RequestOptions) =>
  request<T>('DELETE', path, null, {}, opts);
const upload = <T = unknown>(path: string, form: FormData, opts?: RequestOptions) =>
  request<T>('POST', path, form, {}, opts);

let _cartStore: ReturnType<typeof createCartStore> | null = null;

function getCartStore() {
  if (!_cartStore) {
    _cartStore = createCartStore({
      get,
      post,
      patch,
      del,
      withFallback,
      fetchProduct: (id: number) =>
        isDemoMode() ? Promise.resolve(demoProductGet(id)) : get<Product>(`/products/${id}`),
    });
  }
  return _cartStore;
}

async function afterAuthSession(data: SessionData): Promise<SessionData> {
  auth.persistSession(data);
  try {
    await getCartStore().mergeGuestIfNeeded();
  } catch {
    /* merge failure should not block login */
  }
  return data;
}

const authApi = {
  register: async (data: Record<string, unknown>) => afterAuthSession(await post<SessionData>('/auth/register', data)),
  login: async (phone: string, password: string) => {
    if (matchTemplateAdminCredentials(phone, password)) {
      return afterAuthSession(createTemplateAdminSession());
    }
    if (isTemplateAuthEnabled()) {
      throw new ApiError('نام کاربری یا رمز عبور اشتباه است.', 401);
    }
    return afterAuthSession(await post<SessionData>('/auth/login', { phone, password }));
  },
  adminLogin: async (phone: string, password: string) => {
    if (matchTemplateAdminCredentials(phone, password)) {
      return afterAuthSession(createTemplateAdminSession());
    }
    const data = await post<SessionData>('/auth/admin-login', { phone, password });
    auth.persistSession(data);
    auth.role.set('admin');
    return data;
  },
  otpRequest: (phone: string, purpose = 'login') => post('/auth/otp/request', { phone, purpose }),
  otpVerify: async (phone: string, code: string, purpose = 'login', extras: Record<string, unknown> = {}) =>
    afterAuthSession(await post<SessionData>('/auth/otp/verify', { phone, code, purpose, ...extras })),
  me: () => get<User>('/auth/me'),
  refresh: async () => auth.persistSession(await post<SessionData>('/auth/refresh')),
  logout: async () => {
    try {
      await post('/auth/logout', {}, { skipRefresh: true });
    } catch {
      /* noop */
    }
    auth.clearSession();
  },
  validateSession: async (): Promise<boolean> => {
    if (isTemplateAdminSession()) return true;
    try {
      const user = await get<User>('/auth/me');
      auth.persistSession({ user });
      return true;
    } catch {
      auth.clearSession();
      return false;
    }
  },
  isLoggedIn: () => auth.isLoggedIn(),
  isAdmin: () => auth.role.isAdmin(),
  currentUser: () => auth.getCurrentUser(),
};

const settings = {
  get: () => withFallback(get('/settings'), cfg().fallback?.settings ?? null),
  adminGet: () => get('/admin/settings'),
  adminUpdate: (data: Record<string, unknown>) => patch('/admin/settings', data),
  uploadImage: (type: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return upload(`/admin/settings/upload/${type}`, form);
  },
  paymentInfo: async () => {
    const s = (await settings.get()) as Record<string, unknown> | null;
    if (!s) return null;
    return {
      bankCard: (s.bank_card as string) ?? '',
      bankOwner: (s.bank_owner as string) ?? '',
      method: (s.payment_method as string) ?? 'card_to_card',
    };
  },
};

const users = {
  getProfile: () => get('/users/me'),
  updateProfile: (data: Record<string, unknown>) => patch('/users/me', data),
  changePassword: (cp: string, np: string) =>
    put('/users/me/password', { current_password: cp, new_password: np }),
  getAddresses: () => get<Address[]>('/users/me/addresses'),
  addAddress: (data: Record<string, unknown>) => post('/users/me/addresses', data),
  updateAddress: (id: number, data: Record<string, unknown>) => patch(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: number) => del(`/users/me/addresses/${id}`),
  list: () => get<User[]>('/admin/users'),
  all: () => get<User[]>('/admin/users'),
  updateRole: (id: number, role: string) => patch(`/admin/users/${id}/role`, { role }),
  activate: (id: number) => patch(`/admin/users/${id}/activate`),
  deactivate: (id: number) => patch(`/admin/users/${id}/deactivate`),
  delete: (id: number) => patch(`/admin/users/${id}/deactivate`),
};

const products = {
  list: (filters: ProductListFilters = {}, opts: RequestOptions = {}): Promise<ProductListResponse> => {
    if (isDemoMode()) return Promise.resolve(demoProductList(filters));
    const fb = cfg().fallback?.products ?? { data: [] as Product[] };
    return withFallback(get<ProductListResponse>('/products', filters, opts), fb);
  },
  featured: (limit = 8): Promise<Product[] | ProductListResponse> => {
    if (isDemoMode()) return Promise.resolve(demoProductList({ featured: 1, limit }).data);
    const fb = demoProductList({ featured: 1, limit });
    return withFallback(get('/products/featured', { limit }), fb.data ?? fb);
  },
  get: (id: number | string): Promise<Product> => {
    if (isDemoMode()) {
      const p = demoProductGet(id);
      if (!p) {
        const err = new ApiError(MSG().notFound, 404);
        emitError(err);
        return Promise.reject(err);
      }
      return Promise.resolve(p);
    }
    return get<Product>(`/products/${id}`);
  },
  create: (data: Record<string, unknown>) => post('/admin/products', data),
  update: (id: number, data: Record<string, unknown>) => put(`/admin/products/${id}`, data),
  delete: (id: number) => del(`/admin/products/${id}`),
  toggle: (id: number) => patch(`/admin/products/${id}/toggle`),
  addImage: (id: number, file: File, meta: { alt_text?: string; is_main?: boolean; sort_order?: number } = {}) => {
    const form = new FormData();
    form.append('image', file);
    if (meta.alt_text !== undefined) form.append('alt_text', meta.alt_text);
    if (meta.is_main !== undefined) form.append('is_main', String(meta.is_main));
    if (meta.sort_order !== undefined) form.append('sort_order', String(meta.sort_order));
    return upload(`/admin/products/${id}/images`, form);
  },
  setMainImage: (id: number, imageId: number) => patch(`/admin/products/${id}/images/${imageId}`),
  deleteImage: (id: number, imageId: number) => del(`/admin/products/${id}/images/${imageId}`),
  uploadImage: (id: number, file: File, isMain = false, sortOrder = 0) =>
    products.addImage(id, file, { is_main: isMain, sort_order: sortOrder }),
  listAttributeTypes: () => get('/admin/attribute-types'),
  generateVariants: (id: number, axes: unknown) => post(`/admin/products/${id}/variants/generate`, { axes }),
  bulkUpdateVariants: (id: number, variants: unknown) => put(`/admin/products/${id}/variants/bulk`, { variants }),
  updateVariant: (id: number, data: Record<string, unknown>) => put(`/admin/variants/${id}`, data),
};

const categories = {
  list: (): Promise<Category[]> => {
    if (isDemoMode()) return Promise.resolve(demoCategoriesList());
    return withFallback(get('/categories'), cfg().fallback?.categories ?? []);
  },
  get: (id: number | string): Promise<Category> => {
    if (isDemoMode()) {
      const cat = demoCategoriesList().find((c) => String(c.id) === String(id));
      return cat ? Promise.resolve(cat) : Promise.reject(new ApiError(MSG().notFound, 404));
    }
    return get(`/categories/${id}`);
  },
  bySlug: (slug: string): Promise<Category> => {
    if (isDemoMode()) {
      const cat = demoCategoryBySlug(slug);
      return cat ? Promise.resolve(cat) : Promise.reject(new ApiError(MSG().notFound, 404));
    }
    return get(`/categories/slug/${slug}`);
  },
  create: (data: Record<string, unknown>) => post('/admin/categories', data),
  update: (id: number, data: Record<string, unknown>) => put(`/admin/categories/${id}`, data),
  delete: (id: number) => del(`/admin/categories/${id}`),
  uploadPoster: (id: number, file: File) => {
    const form = new FormData();
    form.append('poster', file);
    return upload(`/admin/categories/${id}/poster`, form);
  },
};

const cart = {
  get: () => getCartStore().get(),
  add: (productId: number, qty = 1, variantId: number | null = null) =>
    getCartStore().add(productId, qty, variantId),
  update: (productId: number, qty: number, variantId: number | null = null) =>
    getCartStore().update(productId, qty, variantId),
  remove: (productId: number, variantId: number | null = null) =>
    getCartStore().remove(productId, variantId),
  clear: () => getCartStore().clear(),
  applyDiscount: (code: string) => getCartStore().applyDiscount(code),
  mergeGuestIfNeeded: () => getCartStore().mergeGuestIfNeeded(),
};

const orders = {
  place: (data: Record<string, unknown>) =>
    isDemoMode() ? Promise.resolve(demoOrderCreate(data as { items?: OrderItemInput[] })) : post('/orders', data),
  create: (data: Record<string, unknown>) =>
    isDemoMode() ? Promise.resolve(demoOrderCreate(data as { items?: OrderItemInput[] })) : post('/orders', data),
  list: () => get<Order[]>('/orders'),
  get: (id: number) => get<Order>(`/orders/${id}`),
  byNumber: (number: string) => get<Order>(`/orders/number/${number}`),
  cancel: (id: number) => patch(`/orders/${id}/cancel`),
  uploadReceipt: (id: number, file: File) =>
    isDemoMode()
      ? Promise.resolve({ success: true, demo: true })
      : (() => {
          const form = new FormData();
          form.append('receipt', file);
          return upload(`/orders/${id}/receipt`, form);
        })(),
  adminList: (params: Record<string, unknown> = {}) => get<Order[]>('/admin/orders', params),
  adminGet: (id: number) => get<Order>(`/admin/orders/${id}`),
  updateStatus: (id: number, status: string, cancelReason?: string) =>
    patch(`/admin/orders/${id}/status`, { status, ...(cancelReason ? { cancel_reason: cancelReason } : {}) }),
  approveReceipt: (id: number) => patch(`/admin/orders/${id}/approve-receipt`),
  rejectReceipt: (id: number, reason: string) =>
    patch(`/admin/orders/${id}/reject-receipt`, { reason }),
};

const discounts = {
  validate: (code: string, total: number) => get('/discounts/validate', { code, total }),
  list: () => get<Discount[]>('/admin/discounts'),
  active: () => get<Discount[]>('/admin/discounts/active'),
  create: (data: Record<string, unknown>) => post('/admin/discounts', data),
  update: (id: number, data: Record<string, unknown>) => put(`/admin/discounts/${id}`, data),
  deactivate: (id: number) => patch(`/admin/discounts/${id}/deactivate`),
  delete: (id: number) => del(`/admin/discounts/${id}`),
};

const promoBanners = {
  list: () => withFallback(get<PromoBanner[] | null>('/promo-banners'), null),
  adminList: () => get<PromoBanner[]>('/admin/promo-banners'),
  create: (file: File, title = '') => {
    const form = new FormData();
    form.append('image', file);
    if (title) form.append('title', title);
    return upload('/admin/promo-banners', form);
  },
  update: (id: number, data: Record<string, unknown>) => put(`/admin/promo-banners/${id}`, data),
  reorder: (ids: number[]) => patch('/admin/promo-banners/reorder', { ids }),
  delete: (id: number) => del(`/admin/promo-banners/${id}`),
};

const dashboard = {
  overview: () => get('/admin/dashboard'),
  stats: () => get<DashboardStats>('/admin/dashboard/stats'),
  recentOrders: (limit = 10) => get('/admin/dashboard/orders/recent', { limit }),
  ordersByStatus: () => get<StatusCount[]>('/admin/dashboard/orders/by-status'),
  lowStock: (threshold = 5) => get('/admin/dashboard/products/low-stock', { threshold }),
  topProducts: (limit = 10) => get('/admin/dashboard/products/top', { limit }),
  revenue: (days = 7) => get('/admin/dashboard/revenue', { days }),
};

const utils = {
  formatPrice,
  toast,
  parsePrice,
};

const api = {
  auth: authApi,
  settings,
  users,
  products,
  categories,
  cart,
  orders,
  discounts,
  promoBanners,
  dashboard,
  utils,
  token: auth.token,
  refreshToken: auth.refreshToken,
  role: auth.role,
  request,
  get,
  post,
  put,
  patch,
  del,
  upload,
  ApiError,
  withFallback,
  persistSession: auth.persistSession,
  clearSession: auth.clearSession,
};

export type Api = typeof api;
export default api;
