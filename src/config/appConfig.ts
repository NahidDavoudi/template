import type { Product, Category } from '../types';
import { demoData } from './demoData';

export interface AppConfig {
  app: { name: string; locale: string };
  demoMode: boolean;
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
    autoRefresh: boolean;
  };
  storage: {
    token: string;
    refreshToken: string;
    role: string;
    user: string;
    guestCart: string;
  };
  messages: {
    network: string;
    timeout: string;
    parse: string;
    unknown: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    validation: string;
    rateLimit: string;
    server: string;
    demoOrder: string;
  };
  fallback: {
    products: { data: Product[] };
    categories: Category[];
    settings: null;
    cart: { items: never[]; total: number };
  };
  hooks: {
    onUnauthorized: (() => void) | null;
    onError: ((err: unknown) => void) | null;
  };
}

export const appConfig: AppConfig = {
  app: {
    name: 'NadStore',
    locale: 'fa-IR',
  },
  demoMode: true,
  api: {
    baseUrl: 'api/v1',
    timeout: 30000,
    retries: 1,
    retryDelay: 600,
    autoRefresh: true,
  },
  storage: {
    token: 'nad_token',
    refreshToken: 'nad_refresh',
    role: 'nad_role',
    user: 'nad_user',
    guestCart: 'nad_guest_cart',
  },
  messages: {
    network: 'خطا در اتصال به سرور. اتصال اینترنت را بررسی کنید.',
    timeout: 'زمان درخواست به پایان رسید. دوباره تلاش کنید.',
    parse: 'پاسخ سرور قابل پردازش نیست.',
    unknown: 'خطای ناشناخته رخ داد.',
    unauthorized: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.',
    forbidden: 'شما اجازه انجام این عملیات را ندارید.',
    notFound: 'مورد درخواستی یافت نشد.',
    validation: 'لطفاً اطلاعات وارد شده را بررسی کنید.',
    rateLimit: 'تعداد درخواست‌ها بیش از حد مجاز است. کمی صبر کنید.',
    server: 'خطای داخلی سرور. بعداً تلاش کنید.',
    demoOrder: 'سفارش نمایشی ثبت شد — این قالب فقط برای نمایش است.',
  },
  fallback: {
    products: { data: demoData.products },
    categories: demoData.categories,
    settings: null,
    cart: { items: [], total: 0 },
  },
  hooks: {
    onUnauthorized: null,
    onError: null,
  },
};
