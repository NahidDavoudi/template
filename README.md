# NadStore

قالب فروشگاه آنلاین فارسی‌زبان برای **نمایش و پیش‌نمایش** — بدون نیاز به بک‌اند.

## ویژگی‌ها

- SPA کامل با Navigo.js (خانه، فروشگاه، محصول، سبد، تسویه، پرداخت، پروفایل، سفارشات)
- صفحات قانونی (درباره ما، تماس، قوانین، حریم خصوصی، FAQ)
- RTL و فارسی
- Tailwind CSS v4
- **حالت نمایشی (demoMode)** — ۱۰ محصول و ۴ دسته‌بندی نمونه
- سفارشی‌سازی از طریق `store.config.js`

## شروع سریع

```bash
npm install
npm run build:css
```

فایل `index.html` را در مرورگر باز کنید (مثلاً با XAMPP: `http://localhost/template/`).

## سفارشی‌سازی

| فایل | محتوا |
|------|--------|
| `assets/js/config/store.config.js` | نام، رنگ‌ها، متن‌ها، تم |
| `assets/images/` | لوگو، hero، تصاویر محصول |
| `assets/js/config/demo.data.js` | محصولات و دسته‌های نمایشی |

## اتصال به بک‌اند واقعی

در `assets/js/config/app.config.js`:

```js
demoMode: false,
api: { baseUrl: 'api/v1' },
```

سپس API PHP/Laravel خود را در پوشه `api/` راه‌اندازی کنید.

## ساختار

```
index.html          ← فروشگاه (SPA)
login.html          ← ورود
admin.html          ← پنل مدیریت (نیاز به API)
assets/js/config/   ← تنظیمات برند
assets/js/core/     ← هسته (router, api, state)
assets/js/pages/    ← منطق صفحات
```

## لایسنس

قالب نمایشی — آزاد برای استفاده در پروژه‌های شخصی و تجاری.
