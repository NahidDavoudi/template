/**
 * app.config.js — تنظیمات زیرساختی NadStore Template
 */
import demoData from './demo.data.js';

export default {
  app: {
    name: 'NadStore',
    locale: 'fa-IR',
  },

  /** حالت نمایشی — بدون نیاز به بک‌اند؛ فقط برای دمو و پیش‌نمایش */
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
