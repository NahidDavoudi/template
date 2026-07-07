# چک‌لیست استقرار Production (MVP)

## قبل از deploy

- [ ] فایل `api/.env` از روی `api/.env.example` ساخته شده
- [ ] `APP_ENV=production`
- [ ] `JWT_SECRET` و `REFRESH_SECRET` حداقل ۳۲ کاراکتر و یکتا
- [ ] `SMS_DRIVER=http` و تنظیمات SMS واقعی پر شده
- [ ] `APP_BASE_PATH` مطابق مسیر نصب روی سرور (مثلاً `/universal`)
- [ ] اطلاعات کارت بانکی از پنل ادمین → تنظیمات ثبت شده
- [ ] migrationهای دیتابیس اجرا شده (شامل `login_attempts.sql`)

## دستورات deploy

```bash
# 1. وابستگی‌های PHP
cd api
composer install --no-dev --optimize-autoloader

# 2. Frontend (Vite build → dist/)
cd ..
npm install
npm run build

# 3. دیتابیس (در MySQL)
# api/database/login_attempts.sql
# api/database/otp_codes.sql
# api/database/product_catalog_migration.sql
# api/database/shop_settings_migration.sql
```

خروجی فرانت‌اند در پوشه `dist/` قرار می‌گیرد؛ این پوشه را به‌عنوان document root فرانت‌اند استفاده کنید.

## پرمیشن‌ها

- [ ] `uploads/` قابل نوشتن توسط PHP (755 یا 775)
- [ ] `api/storage/logs/` قابل نوشتن (755 یا 775)
- [ ] `api/.env` فقط برای وب‌سرور قابل خواندن (600 یا 640)

## Apache / Nginx

- [ ] Document root به خروجی `dist/` (یا ریشه پروژه برای حالت توسعه) اشاره کند
- [ ] **SPA fallback:** چون از مسیریابی مرورگری استفاده می‌شود، تمام مسیرهای ناشناخته (به‌جز فایل‌های استاتیک و `/api`) باید به `index.html` برگردانده شوند
- [ ] rewrite برای API به `api/index.php`
- [ ] `.htaccess` دامنه production بررسی شده

### نمونه Apache (SPA fallback)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### نمونه Nginx (SPA fallback)

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## بعد از deploy

- [ ] `docs/SMOKE_TEST.md` اجرا شده
- [ ] لاگ `api/storage/logs/` بدون خطای 5xx تکراری
- [ ] صفحه پرداخت شماره کارت واقعی (نه پیام fallback) نشان می‌دهد

## Rollback

- نسخه قبلی `.env` و دیتابیس backup
- restore فایل‌ها + `composer install`
- بررسی migrationها قبل از rollback schema
