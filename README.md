# NadStore

قالب فروشگاه آنلاین فارسی‌زبان (React + TypeScript + Vite) برای **نمایش و پیش‌نمایش** — با مسیریابی مرورگری (browser-style routes).

## ویژگی‌ها

- SPA کامل با React Router (خانه، فروشگاه، محصول، سبد، تسویه، پرداخت، پروفایل، سفارشات)
- صفحات قانونی (درباره ما، تماس، قوانین، حریم خصوصی، بازگشت وجه، FAQ)
- پنل مدیریت کامل با داشبورد، محصولات/ویرایشگر محصول، دسته‌بندی‌ها، سفارش‌ها، کاربران، تخفیف‌ها، پوسترها، تنظیمات و محتوای صفحات
- جریان ورود/ثبت‌نام با پشتیبانی OTP پیامکی و ورود نمایشی ادمین
- RTL و فارسی، اعداد و قیمت فارسی
- Tailwind CSS v4
- **حالت نمایشی (demoMode)** — محصولات و دسته‌بندی‌های نمونه
- سفارشی‌سازی از طریق `src/config/storeConfig.ts`

## شروع سریع

```bash
npm install
npm run dev      # توسعه روی http://localhost:5173
npm run build    # خروجی تولید در dist/
npm run preview  # پیش‌نمایش build روی http://localhost:4173
```

## سفارتی‌سازی

| فایل | محتوا |
|------|--------|
| `src/config/storeConfig.ts` | نام، رنگ‌ها، متن‌ها، تم، مسیرها |
| `public/assets/images/` | لوگو، hero، تصاویر محصول |
| `public/assets/fonts/` | فونت‌ها |
| `src/config/demoData.ts` | محصولات و دسته‌های نمایشی |
| `src/config/appConfig.ts` | تنظیمات API و demoMode |

## اتصال به بک‌اند واقعی

در `src/config/appConfig.ts`:

```ts
demoMode: false,
api: { baseUrl: 'api/v1' },
```

سپس API PHP/Laravel خود را راه‌اندازی کنید.

## ساختار

```
index.html          ← پوسته Vite (lang=fa, dir=rtl, #root)
src/main.tsx        ← نقطه ورود React
src/App.tsx         ← BrowserRouter + تعریف مسیرها
src/config/         ← تنظیمات برند و داده نمایشی
src/core/           ← هسته تایپ‌شده (api, auth, cart, demoApi, theme)
src/context/        ← React contexts (Auth, Cart, Config, Toast)
src/components/     ← اجزای مشترک فروشگاه
src/pages/          ← صفحات فروشگاه و ورود
src/admin/          ← پنل مدیریت (layout + صفحات ادمین)
public/assets/      ← دارایی‌های استاتیک (تصاویر، فونت‌ها، داده)
```

## میزبانی استاتیک (SPA fallback)

چون از مسیریابی مرورگری استفاده می‌شود، وب‌سرور باید برای مسیرهای ناشناخته به `index.html` برگردد. نمونه Apache در `.htaccess` و نمونه Nginx در `docs/DEPLOY.md`.

## لایسنس

قالب نمایشی — آزاد برای استفاده در پروژه‌های شخصی و تجاری.
