export interface NavLink {
  href: string;
  label: string;
}

export interface MobileNavItem {
  id?: string;
  href?: string;
  label: string;
  icon: string;
  routes: string[];
}

export interface LegalSection {
  title: string;
  content?: string[];
  items?: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface WhyChooseItem {
  icon: string;
  title: string;
  desc: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

export interface LegalContactInfo {
  label: string;
  value: string;
  note?: string;
}

export interface ContactFormTexts {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  subjects: string[];
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  success: string;
}

export interface AboutTexts {
  meta: string;
  title: string;
  subtitle: string;
  icon: string;
  intro: string;
  sectionTitles: {
    intro: string;
    mission: string;
    vision: string;
    whyChooseUs: string;
    stats: string;
    team: string;
  };
  mission: string;
  vision: string;
  whyChooseUs: WhyChooseItem[];
  stats: StatItem[];
  team: TeamMember[];
}

export interface ContactTexts {
  meta: string;
  title: string;
  subtitle: string;
  icon: string;
  formSectionTitle: string;
  formUnavailable: string;
  phone: LegalContactInfo;
  email: LegalContactInfo;
  address: LegalContactInfo;
  hours: LegalContactInfo;
  mapPlaceholder: string;
  form: ContactFormTexts;
}

export interface TermsTexts {
  meta: string;
  title: string;
  subtitle: string;
  icon: string;
  sections: LegalSection[];
}

export interface FaqTexts {
  meta: string;
  title: string;
  subtitle: string;
  icon: string;
  items: FaqItem[];
}

export interface LegalTexts {
  footerLinks: NavLink[];
  lastUpdated: string;
  about: AboutTexts;
  contact: ContactTexts;
  terms: TermsTexts;
  privacy: TermsTexts;
  refund: TermsTexts;
  faq: FaqTexts;
}

export interface OrderStatusInfo {
  label: string;
  cls: string;
}

export type OrderStatusMap = Record<string, OrderStatusInfo>;

export interface ToastPalette {
  bg: string;
  text: string;
  border: string;
}

export interface StoreConfig {
  name: string;
  logo: string;
  favicon: string;
  logoVariants?: { large: string; medium: string; thumb: string };
  faviconVariants?: { large: string; medium: string; thumb: string };
  hero: {
    image: string;
    imageVariants?: { large: string; medium: string; thumb: string };
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  theme: {
    primary: string;
    primaryHover: string;
    background: string;
    surface: string;
    card: string;
    border: string;
    muted: string;
    textDim: string;
    bodyText: string;
  };
  fonts: { body: string; display: string; felipa: string };
  shipping: { freeFrom: number; standardCost: number; minOrder: number };
  addresses: { maxCount: number };
  data: { iranLocations: string };
  payment: {
    cardNumber: string;
    cardOwner: string;
    method: string;
    unavailableMessage: string;
    zarinpalMerchantId?: string;
  };
  ui: {
    cardRadius: string;
    btnRadius: string;
    btnAluminum: string;
    btnGlass: string;
    btnPrimary: string;
    cardBase: string;
    cardHover: string;
    productCardAspect: string;
    toast: Record<'success' | 'error' | 'warning' | 'info', ToastPalette>;
    variant: Record<string, string>;
  };
  promoSlider: {
    autoplayMs: number;
    speed: number;
    aspect: string;
    fallbackBanners: { id: number; title: string; image_url: string }[];
  };
  images: {
    variants: string[];
    defaultSize: Record<string, string>;
    presets: Record<string, Record<string, number>>;
  };
  carousel: {
    featured: {
      viewAllHref: string;
      backgroundColor: string;
    };
  };
  auth: {
    smsOtpEnabled: boolean;
    templateAdmin: { username: string; password: string; displayName: string };
  };
  texts: {
    nav: NavLink[];
    mobileBottomNav: MobileNavItem[];
    profile: Record<string, string>;
    checkout: Record<string, string>;
    home: { featured: string; newest: string; viewAll: string };
    shop: {
      allProducts: string;
      filtersTitle: string;
      sizeLabel: string;
      colorLabel: string;
      priceLabel: string;
      applyFilters: string;
      clearFilters: string;
      showMore: string;
      productsFound: string;
      loading: string;
      empty: string;
      emptyAction: string;
      filterToggle: string;
      breadcrumbHome: string;
      breadcrumbShop: string;
      sizes: string[];
      colors: { id: string; label: string }[];
      priceRange: { min: number; max: number; step: number };
      pageSize: number;
    };
    product: {
      loading: string;
      refPrefix: string;
      sizeLabel: string;
      sizeGuide: string;
      sizeGuideHref: string;
      addToCart: string;
      quickBuy: string;
      addedToCart: string;
      viewCart: string;
      detailsTitle: string;
      shippingTitle: string;
      shippingText: string;
      completeStyle: string;
      viewAll: string;
      defaultSizes: string[];
      detailItems: string[];
      selectVariant: string;
      selectOptionsHint: string;
      outOfStock: string;
    };
    footer: {
      tagline: string;
      support: string;
      social: string;
      copyright: string;
      enamad: Enamad | null;
    };
    auth: Record<string, string>;
    legal: LegalTexts;
    newsletter: { title: string; subtitle: string; button: string; placeholder: string };
    admin: {
      title: string;
      panelLabel: string;
      logout: string;
      lightMode: string;
      loading: string;
      nav: Record<string, string>;
      dashboard: Record<string, unknown>;
      products: Record<string, string>;
      categories: Record<string, string>;
      orders: Record<string, string>;
      users: Record<string, string>;
      discounts: Record<string, string>;
      promoBanners: Record<string, string>;
      settings: {
        title: string;
        subtitle: string;
        tabs: Record<string, string>;
        identity: Record<string, string>;
        payment: Record<string, string>;
        contact: Record<string, string>;
        shipping: Record<string, string>;
        sms: Record<string, string>;
        seo: Record<string, string>;
        save: string;
        saving: string;
        saved: string;
        loading: string;
        uploadSuccess: string;
      };
      pages: Record<string, unknown>;
      orderStatuses: OrderStatusMap;
      common: Record<string, string>;
    };
  };
  api: { baseUrl: string };
}

export interface Enamad {
  href: string;
  logoUrl: string;
  code?: string;
}

const P = (p: string) => `/assets/${p}`;

export const defaultStoreConfig: StoreConfig = {
  name: 'NadStore',
  logo: P('images/logo.png'),
  favicon: P('images/logo.png'),
  hero: {
    image: P('images/hero.png'),
    title: 'NadStore',
    subtitle: 'فروشگاه آنلاین مدرن — قالب نمایشی',
    ctaPrimary: 'مشاهده محصولات',
    ctaSecondary: 'دسته‌بندی‌ها',
  },
  theme: {
    primary: '#6B0000',
    primaryHover: '#550000',
    background: '#ffffff',
    surface: '#F7F7F7',
    card: '#ffffff',
    border: '#E5E5E5',
    muted: '#737373',
    textDim: 'rgba(45, 45, 45, 0.5)',
    bodyText: '#2d2d2d',
  },
  fonts: { body: 'Vazirmatn', display: 'Agbalumo', felipa: 'Felipa' },
  shipping: { freeFrom: 1500000, standardCost: 50000, minOrder: 0 },
  addresses: { maxCount: 3 },
  data: { iranLocations: '/assets/data/provinces_cities_counties.json' },
  payment: {
    cardNumber: '6037-9977-1234-5678',
    cardOwner: 'NadStore Demo',
    method: 'card_to_card',
    unavailableMessage: 'اطلاعات کارت در حالت نمایشی تنظیم نشده است.',
  },
  ui: {
    cardRadius: 'rounded-2xl',
    btnRadius: 'rounded-full',
    btnAluminum: 'btn-accent',
    btnGlass: 'btn-glass',
    btnPrimary: 'btn-accent',
    cardBase: 'bg-card border border-border',
    cardHover:
      'hover:shadow-[0_12px_40px_rgba(107,0,0,0.12)] hover:border-accent/30 transition-all duration-500',
    productCardAspect: 'aspect-[4/5]',
    toast: {
      success: { bg: '#16a34a', text: '#ffffff', border: '#15803d' },
      error: { bg: '#6B0000', text: '#ffffff', border: '#550000' },
      warning: { bg: '#eab308', text: '#422006', border: '#ca8a04' },
      info: { bg: '#2563eb', text: '#ffffff', border: '#1d4ed8' },
    },
    variant: {
      swatchActive: 'is-active border-accent ring-2 ring-accent/30',
      swatchInactive: 'border-border',
      swatchDisabled: 'opacity-30 cursor-not-allowed',
      textActive: 'is-active bg-accent text-white border-accent',
      textInactive: 'bg-card text-body border-border hover:border-accent/40',
      textDisabled: 'bg-card border-border text-muted/50 cursor-not-allowed opacity-50',
    },
  },
  promoSlider: {
    autoplayMs: 5000,
    speed: 800,
    aspect: 'aspect-[21/9]',
    fallbackBanners: [{ id: 0, title: 'پوستر تبلیغاتی', image_url: P('images/poster.png') }],
  },
  images: {
    variants: ['large', 'medium', 'thumb'],
    defaultSize: { card: 'medium', thumb: 'thumb', detail: 'large', logo: 'thumb', hero: 'large', banner: 'medium' },
    presets: {
      products: { large: 1600, medium: 800, thumb: 300 },
      categories: { large: 1200, medium: 600, thumb: 300 },
      promoBanners: { large: 1920, medium: 1200, thumb: 400 },
      logo: { large: 256, medium: 128, thumb: 64 },
      hero: { large: 1920, medium: 1200, thumb: 400 },
    },
  },
  carousel: {
    featured: { viewAllHref: '/shop?featured=1', backgroundColor: '#ffffff' },
  },
  auth: {
    smsOtpEnabled: false,
    templateAdmin: { username: 'admin', password: 'admin1234', displayName: 'مدیر فروشگاه' },
  },
  texts: {
    nav: [
      { href: '/', label: 'خانه' },
      { href: '/shop', label: 'فروشگاه' },
      { href: '/categories', label: 'دسته‌بندی‌ها' },
      { href: '/orders', label: 'سفارشات' },
    ],
    mobileBottomNav: [
      { href: '/', label: 'صفحه اصلی', icon: 'home', routes: ['/', ''] },
      { href: '/shop', label: 'فروشگاه', icon: 'store', routes: ['/shop', '/product'] },
      { href: '/categories', label: 'دسته‌بندی‌ها', icon: 'layout-grid', routes: ['/categories'] },
      { id: 'profile', label: 'پروفایل', icon: 'user', routes: ['/profile', '/orders'] },
    ],
    profile: {
      title: 'پروفایل من',
      subtitle: 'مدیریت آدرس‌های ارسال',
      addressesTitle: 'آدرس‌های من',
      addAddress: 'افزودن آدرس',
      editAddress: 'ویرایش آدرس',
      deleteAddress: 'حذف',
      setDefault: 'انتخاب به‌عنوان پیش‌فرض',
      defaultBadge: 'پیش‌فرض',
      empty: 'هنوز آدرسی ذخیره نشده',
      maxReached: 'حداکثر ۳ آدرس می‌توانید ذخیره کنید',
      saved: 'آدرس ذخیره شد',
      updated: 'آدرس بروزرسانی شد',
      deleted: 'آدرس حذف شد',
      confirmDelete: 'این آدرس حذف شود؟',
      ordersLink: 'سفارشات من',
      needLogin: 'برای مدیریت آدرس‌ها وارد شوید',
      loginBtn: 'ورود به حساب',
      save: 'ذخیره آدرس',
      cancel: 'انصراف',
      titleLabel: 'عنوان آدرس',
      titlePlaceholder: 'مثلاً: منزل، محل کار',
      receiverLabel: 'نام گیرنده',
      phoneLabel: 'شماره تماس',
      provinceLabel: 'استان',
      cityLabel: 'شهر',
      postalLabel: 'کد پستی',
      addressLabel: 'آدرس دقیق',
      addressPlaceholder: 'خیابان، کوچه، پلاک، واحد',
      defaultLabel: 'آدرس پیش‌فرض',
      slotInfo: 'می‌توانید تا ۳ آدرس ذخیره کنید',
    },
    checkout: {
      savedAddresses: 'آدرس‌های ذخیره‌شده',
      newAddress: 'آدرس جدید',
      saveAddress: 'ذخیره این آدرس برای خریدهای بعد',
      defaultAddressTitle: 'آدرس checkout',
    },
    home: { featured: 'محبوب‌ترین‌ها', newest: 'جدیدترین محصولات', viewAll: 'همه' },
    shop: {
      allProducts: 'همه محصولات',
      filtersTitle: 'فیلترها',
      sizeLabel: 'سایز',
      colorLabel: 'رنگ',
      priceLabel: 'محدوده قیمت (تومان)',
      applyFilters: 'اعمال فیلترها',
      clearFilters: 'پاک کردن فیلترها',
      showMore: 'نمایش بیشتر',
      productsFound: 'محصول یافت شد',
      loading: 'در حال بارگذاری...',
      empty: 'محصولی یافت نشد.',
      emptyAction: 'بازگشت',
      filterToggle: 'فیلتر',
      breadcrumbHome: 'خانه',
      breadcrumbShop: 'فروشگاه',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { id: 'black', label: 'مشکی زغالی' },
        { id: 'white', label: 'سفید یخی' },
        { id: 'grey', label: 'خاکستری تیره' },
      ],
      priceRange: { min: 0, max: 5000000, step: 50000 },
      pageSize: 8,
    },
    product: {
      loading: 'در حال بارگذاری...',
      refPrefix: 'REF:',
      sizeLabel: 'سایز',
      sizeGuide: 'راهنمای سایز',
      sizeGuideHref: '#',
      addToCart: 'افزودن به سبد خرید',
      quickBuy: 'خرید فوری',
      addedToCart: 'محصول به سبد خرید اضافه شد',
      viewCart: 'مشاهده سبد خرید',
      detailsTitle: 'جزئیات و ترکیبات',
      shippingTitle: 'ارسال و مرجوعی',
      shippingText:
        'ارسال رایگان برای سفارش‌های بالای ۱،۵۰۰،۰۰۰ تومان. امکان مرجوعی تا ۷ روز پس از تحویل برای محصولات استفاده‌نشده.',
      completeStyle: 'تکمیل استایل',
      viewAll: 'مشاهده همه',
      defaultSizes: ['XS', 'S', 'M', 'L'],
      detailItems: ['چاپ با کیفیت بالا', 'لبه‌های خام و بافت طبیعی', 'شستشو با آب سرد و پشت‌و‌رو'],
      selectVariant: 'لطفاً گزینه محصول را انتخاب کنید',
      selectOptionsHint: 'لطفاً سایز و رنگ را انتخاب کنید',
      outOfStock: 'ناموجود',
    },
    footer: {
      tagline: 'NadStore — قالب فروشگاه آنلاین برای نمایش و پیش‌نمایش.',
      support: 'پشتیبانی ۷ روز هفته',
      social: '@nadstore',
      copyright: '© ۱۴۰۴ NadStore — قالب نمایشی',
      enamad: null,
    },
    auth: {
      registerSubmit: 'ثبت‌نام',
      loginWithSms: 'ورود با پیامک',
      loginWithPassword: 'ورود با رمز عبور',
      sendCode: 'ارسال کد تایید',
      resendCode: 'ارسال مجدد کد',
      verifyCode: 'تایید و ورود',
      verifyAndRegister: 'تایید و ساخت حساب',
      otpSent: 'کد تایید به شماره شما ارسال شد',
      otpPlaceholder: 'کد ۵ رقمی',
      otpExpires: 'اعتبار کد',
      seconds: 'ثانیه',
      back: 'بازگشت',
      sending: 'در حال ارسال...',
      verifying: 'در حال تایید...',
    },
    legal: {
      footerLinks: [
        { href: '/about', label: 'درباره ما' },
        { href: '/contact', label: 'تماس با ما' },
        { href: '/terms', label: 'قوانین و مقررات' },
        { href: '/privacy', label: 'حریم خصوصی' },
        { href: '/refund', label: 'بازگشت وجه' },
        { href: '/faq', label: 'سوالات متداول' },
      ],
      lastUpdated: '۱۴۰۴/۰۳/۰۱',
      about: {
        meta: 'آشنایی با NadStore — قالب فروشگاه آنلاین برای نمایش UI و تجربه کاربری.',
        title: 'درباره ما',
        subtitle: 'NadStore؛ قالب آماده فروشگاه آنلاین.',
        icon: 'sparkles',
        intro:
          'NadStore یک قالب فروشگاه آنلاین فارسی‌زبان است که برای نمایش، پیش‌نمایش و توسعه فرانت‌اند طراحی شده. شامل صفحات محصول، سبد خرید، تسویه حساب، پروفایل و صفحات قانونی است. در حالت نمایشی، تمام داده‌ها به‌صورت محلی بارگذاری می‌شوند و نیازی به سرور ندارند.',
        sectionTitles: {
          intro: 'معرفی NadStore',
          mission: 'مأموریت ما',
          vision: 'چشم‌انداز ما',
          whyChooseUs: 'چرا NadStore؟',
          stats: 'NadStore در یک نگاه',
          team: 'تیم ما',
        },
        mission:
          'ارائه پوشاک مدرن و باکیفیت با قیمت منصفانه، حفظ استانداردهای بالای تولید و ایجاد ارتباطی صادقانه با مشتریان در سراسر ایران.',
        vision:
          'ارائه یک قالب فروشگاه آنلاین کامل، زیبا و قابل سفارشی‌سازی برای توسعه‌دهندگان و کسب‌وکارهای ایرانی.',
        whyChooseUs: [
          { icon: 'shield-check', title: 'خرید مطمئن', desc: 'پرداخت امن و پشتیبانی پاسخگو در تمام مراحل سفارش.' },
          { icon: 'truck', title: 'ارسال سریع', desc: 'ارسال به سراسر کشور با بسته‌بندی ایمن و پیگیری آنلاین.' },
          { icon: 'refresh-ccw', title: 'مرجوعی آسان', desc: 'امکان بازگشت محصول تا ۷ روز پس از تحویل طبق شرایط.' },
          { icon: 'gem', title: 'کیفیت برتر', desc: 'انتخاب پارچه‌های مرغوب و کنترل کیفیت پیش از ارسال.' },
        ],
        stats: [
          { value: '۵۰۰۰+', label: 'مشتری راضی' },
          { value: '۲۰۰+', label: 'محصول فعال' },
          { value: '۳۱', label: 'استان تحت پوشش' },
          { value: '۹۸٪', label: 'رضایت خریداران' },
        ],
        team: [
          { name: 'سارا محمدی', role: 'مدیرعامل و بنیان‌گذار', avatar: '' },
          { name: 'امیر حسینی', role: 'مدیر طراحی و تولید', avatar: '' },
          { name: 'نیلوفر کریمی', role: 'مدیر پشتیبانی مشتریان', avatar: '' },
          { name: 'رضا احمدی', role: 'مدیر فنی و فروشگاه آنلاین', avatar: '' },
        ],
      },
      contact: {
        meta: 'راه‌های ارتباطی با فروشگاه NadStore — تلفن، ایمیل، آدرس، ساعات کاری و فرم تماس برای پشتیبانی و سوالات.',
        title: 'تماس با ما',
        subtitle:
          'تیم پشتیبانی NadStore آماده پاسخگویی به سوالات شما درباره محصولات، سفارشات و همکاری است.',
        icon: 'message-circle',
        formSectionTitle: 'راه‌های ارتباطی',
        formUnavailable: 'فرم تماس به‌زودی فعال می‌شود. لطفاً از اطلاعات تماس بالا استفاده کنید.',
        phone: { label: 'تلفن تماس', value: '۰۲۱-۹۱۰۰۱۲۳۴', note: 'شنبه تا پنج‌شنبه، ۹ تا ۱۸' },
        email: { label: 'ایمیل', value: 'hello@nadstore.demo', note: 'پاسخ‌دهی در حالت نمایشی غیرفعال است' },
        address: { label: 'آدرس', value: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲۳۴، واحد ۵', note: 'مراجعه حضوری با هماهنگی قبلی' },
        hours: { label: 'ساعات کاری', value: 'شنبه تا پنج‌شنبه: ۹:۰۰ – ۱۸:۰۰', note: 'جمعه‌ها و تعطیلات رسمی تعطیل' },
        mapPlaceholder: 'نقشه محل فروشگاه',
        form: {
          nameLabel: 'نام و نام‌خانوادگی',
          namePlaceholder: 'مثال: علی رضایی',
          emailLabel: 'ایمیل',
          emailPlaceholder: 'example@email.com',
          phoneLabel: 'شماره موبایل',
          phonePlaceholder: '۰۹۱۲۳۴۵۶۷۸۹',
          subjectLabel: 'موضوع',
          subjectPlaceholder: 'انتخاب موضوع',
          subjects: ['پیگیری سفارش', 'سوال درباره محصول', 'مرجوعی و بازگشت وجه', 'همکاری و عمده‌فروشی', 'سایر موارد'],
          messageLabel: 'پیام شما',
          messagePlaceholder: 'پیام خود را بنویسید...',
          submit: 'ارسال پیام',
          success: 'پیام شما با موفقیت ثبت شد. به زودی با شما تماس می‌گیریم.',
        },
      },
      terms: {
        meta: 'قوانین و مقررات استفاده از فروشگاه آنلاین NadStore — شرایط سفارش، پرداخت، تعهدات طرفین و حقوق مالکیت معنوی.',
        title: 'قوانین و مقررات',
        subtitle: 'لطفاً پیش از ثبت سفارش، قوانین زیر را با دقت مطالعه فرمایید.',
        icon: 'scale',
        sections: [
          {
            title: 'تعاریف و پذیرش قوانین',
            content: [
              'منظور از «فروشگاه» وب‌سایت NadStore و کلیه خدمات آنلاین مرتبط است. «کاربر» هر شخصی است که از خدمات فروشگاه استفاده می‌کند.',
              'ثبت‌نام، ورود یا ثبت سفارش به منزله پذیرش کامل این قوانین و مقررات است.',
            ],
          },
          {
            title: 'تعهدات کاربر',
            items: [
              'ارائه اطلاعات صحیح و کامل هنگام ثبت‌نام و ثبت سفارش.',
              'حفظ امنیت حساب کاربری و عدم افشای رمز عبور به دیگران.',
              'استفاده از فروشگاه صرفاً برای اهداف قانونی و شخصی.',
              'عدم سوءاستفاده از کدهای تخفیف، سیستم پرداخت یا فرآیند سفارش.',
              'رعایت قوانین جمهوری اسلامی ایران در تمام تعاملات.',
            ],
          },
          {
            title: 'تعهدات فروشگاه',
            items: [
              'نمایش دقیق مشخصات، تصاویر و قیمت محصولات تا حد امکان.',
              'ارسال سفارش در بازه زمانی اعلام‌شده پس از تأیید پرداخت.',
              'حفظ امنیت اطلاعات شخصی کاربران طبق سیاست حریم خصوصی.',
              'پاسخگویی به درخواست‌ها و شکایات مشتریان در اسرع وقت.',
              'رعایت قوانین تجارت الکترونیک و حمایت از حقوق مصرف‌کننده.',
            ],
          },
          {
            title: 'قوانین سفارش‌دهی',
            items: [
              'سفارش پس از ثبت و تأیید پرداخت نهایی می‌شود و قابل لغو نیست مگر طبق سیاست مرجوعی.',
              'موجودی محصولات محدود است و در صورت اتمام موجودی، سفارش لغو و مبلغ بازگردانده می‌شود.',
              'انتخاب سایز و رنگ بر عهده مشتری است؛ لطفاً راهنمای سایز را مطالعه کنید.',
              'فروشگاه حق دارد در صورت بروز خطای قیمت‌گذاری یا اطلاعات، سفارش را لغو کند.',
            ],
          },
          {
            title: 'قوانین پرداخت',
            content: [
              'پرداخت از طریق کارت به کارت یا درگاه‌های معتبر بانکی انجام می‌شود. مبلغ سفارش باید حداکثر تا ۲۴ ساعت پس از ثبت سفارش واریز شود.',
            ],
            items: [
              'مسئولیت صحت اطلاعات پرداخت بر عهده مشتری است.',
              'در صورت عدم واریز به موقع، سفارش به صورت خودکار لغو می‌شود.',
              'رسید پرداخت باید خوانا و مطابق مبلغ سفارش باشد.',
              'هزینه ارسال طبق شرایط اعلام‌شده در صفحه سبد خرید محاسبه می‌شود.',
            ],
          },
          {
            title: 'مالکیت معنوی',
            content: [
              'کلیه محتوای وب‌سایت شامل لوگو، تصاویر، طراحی‌ها، متون و نام تجاری NadStore تحت حمایت قوانین مالکیت فکری است.',
            ],
            items: [
              'کپی‌برداری، بازنشر یا استفاده تجاری بدون مجوز کتبی ممنوع است.',
              'طراحی‌های اختصاصی NadStore متعلق به این برند است.',
              'کاربران حق دانلود یا ذخیره محتوا برای استفاده غیرمجاز را ندارند.',
            ],
          },
        ],
      },
      privacy: {
        meta: 'سیاست حریم خصوصی NadStore — نحوه جمع‌آوری، استفاده، نگهداری و حفاظت از اطلاعات شخصی کاربران.',
        title: 'حریم خصوصی',
        subtitle:
          'حفاظت از اطلاعات شما برای ما اولویت دارد. در این صفحه نحوده برخورد با داده‌های شخصی توضیح داده شده است.',
        icon: 'lock',
        sections: [
          {
            title: 'سیاست جمع‌آوری داده‌ها',
            content: [
              'ما اطلاعاتی را که شما داوطلبانه در اختیار ما قرار می‌دهید جمع‌آوری می‌کنیم. این اطلاعات برای ارائه خدمات فروشگاه ضروری است.',
            ],
            items: [
              'اطلاعات هویتی: نام، شماره موبایل، ایمیل.',
              'اطلاعات سفارش: آدرس، کد پستی، استان و شهر.',
              'اطلاعات پرداخت: شماره تراکنش و تصویر رسید (بدون ذخیره اطلاعات کارت بانکی).',
              'اطلاعات فنی: آدرس IP، نوع مرورگر و دستگاه برای بهبود امنیت.',
            ],
          },
          {
            title: 'سیاست استفاده از داده‌ها',
            items: [
              'پردازش و ارسال سفارشات ثبت‌شده.',
              'ارتباط با مشتری درباره وضعیت سفارش و پشتیبانی.',
              'بهبود تجربه کاربری و عملکرد وب‌سایت.',
              'ارسال اطلاع‌رسانی‌های مرتبط (در صورت عضویت در خبرنامه).',
              'جلوگیری از تقلب و سوءاستفاده از خدمات.',
            ],
          },
          {
            title: 'سیاست کوکی‌ها',
            content: [
              'وب‌سایت NadStore از کوکی‌ها و فناوری‌های مشابه برای بهبود عملکرد و حفظ وضعیت ورود شما استفاده می‌کند.',
            ],
            items: [
              'کوکی‌های ضروری: برای عملکرد صحیح سبد خرید و ورود به حساب.',
              'کوکی‌های تحلیلی: برای درک رفتار کاربران و بهبود خدمات (ناشناس).',
              'شما می‌توانید کوکی‌ها را از تنظیمات مرورگر غیرفعال کنید؛ ممکن است برخی امکانات محدود شوند.',
            ],
          },
          {
            title: 'سیاست امنیت اطلاعات',
            content: [
              'ما از روش‌های فنی و سازمانی مناسب برای محافظت از اطلاعات شما استفاده می‌کنیم.',
            ],
            items: [
              'رمزنگاری ارتباطات (HTTPS/SSL) در تمام صفحات.',
              'محدودیت دسترسی کارکنان به اطلاعات شخصی.',
              'نگهداری امن اطلاعات در سرورهای داخل کشور.',
              'عدم فروش یا واگذاری اطلاعات شخصی به اشخاص ثالث بدون رضایت شما.',
              'در صورت نقض امنیتی، اطلاع‌رسانی به کاربران طبق قوانین.',
            ],
          },
        ],
      },
      refund: {
        meta: 'شرایط بازگشت وجه و لغو سفارش در فروشگاه NadStore — قوانین مرجوعی، تعویض و رسیدگی به کالای آسیب‌دیده.',
        title: 'شرایط بازگشت وجه و لغو سفارش',
        subtitle:
          'ما رضایت شما را جدی می‌گیریم. در این صفحه شرایط مرجوعی، تعویض و بازپرداخت توضیح داده شده است.',
        icon: 'rotate-ccw',
        sections: [
          {
            title: 'شرایط مرجوعی کالا',
            items: [
              'حداکثر ۷ روز کاری از تاریخ تحویل برای درخواست مرجوعی.',
              'محصول باید استفاده‌نشده، بدون لکه و با برچسب اصلی باشد.',
              'بسته‌بندی اصلی سالم و کامل باشد.',
              'لباس‌های زیرمجموعه بهداشتی و محصولات سفارشی قابل مرجوعی نیستند.',
              'هزینه ارسال مرجوعی در صورت تغییر نظر مشتری بر عهده خریدار است.',
            ],
          },
          {
            title: 'فرآیند بازگشت وجه',
            content: [
              'پس از دریافت و بررسی کالای مرجوعی، مبلغ ظرف ۳ تا ۷ روز کاری به حساب بانکی شما واریز می‌شود.',
            ],
            items: [
              'ثبت درخواست مرجوعی از طریق تماس با پشتیبانی یا فرم تماس.',
              'دریافت کد مرجوعی و آدرس ارسال کالا.',
              'ارسال محصول با بسته‌بندی مناسب.',
              'بررسی کیفیت توسط تیم NadStore.',
              'واریز مبلغ به شماره شبا یا کارت ثبت‌شده در سفارش.',
            ],
          },
          {
            title: 'سیاست تعویض',
            items: [
              'امکان تعویض سایز یا رنگ تا ۷ روز پس از تحویل (در صورت موجودی).',
              'تفاوت قیمت سایزها یا مدل‌های متفاوت توسط مشتری پرداخت می‌شود.',
              'ارسال مجدد کالای جایگزین پس از دریافت محصول اولیه.',
              'در صورت عدم موجودی، بازگشت وجه انجام می‌شود.',
            ],
          },
          {
            title: 'سیاست کالای آسیب‌دیده یا معیوب',
            content: [
              'اگر محصول آسیب‌دیده یا معیوب دریافت کردید، ظرف ۴۸ ساعت به پشتیبانی اطلاع دهید.',
            ],
            items: [
              'ارسال تصویر واضح از آسیب از طریق واتساپ یا ایمیل.',
              'هزینه ارسال مجدد یا بازگشت وجه بر عهده فروشگاه است.',
              'در صورت تأیید نقص تولیدی، تعویض رایگان یا بازگشت کامل وجه انجام می‌شود.',
              'آسیب ناشی از استفاده نادرست مشمول این سیاست نیست.',
            ],
          },
        ],
      },
      faq: {
        meta: 'پاسخ سوالات متداول درباره خرید، ارسال، پرداخت، سایزبندی و مرجوعی در فروشگاه آنلاین لباس NadStore.',
        title: 'سوالات متداول',
        subtitle: 'پاسخ رایج‌ترین سوالات درباره خرید، ارسال و پشتیبانی.',
        icon: 'help-circle',
        items: [
          { question: 'چگونه می‌توانم سفارش ثبت کنم؟', answer: 'محصول مورد نظر را انتخاب کنید، سایز و تعداد را مشخص کرده و به سبد خرید اضافه کنید. سپس اطلاعات ارسال را وارد کرده و پرداخت را انجام دهید.' },
          { question: 'روش‌های پرداخت چیست؟', answer: 'پرداخت از طریق کارت به کارت به شماره حساب اعلام‌شده در صفحه پرداخت انجام می‌شود. پس از واریز، تصویر رسید را بارگذاری کنید.' },
          { question: 'هزینه ارسال چقدر است؟', answer: 'هزینه ارسال استاندارد ۵۰,۰۰۰ تومان است. برای سفارش‌های بالای ۱,۵۰۰,۰۰۰ تومان ارسال رایگان است.' },
          { question: 'سفارش من چند روز طول می‌کشد تا برسد؟', answer: 'سفارش‌های تهران ۱ تا ۳ روز کاری و سایر شهرها ۳ تا ۷ روز کاری پس از تأیید پرداخت ارسال می‌شوند.' },
          { question: 'آیا امکان پرداخت در محل وجود دارد؟', answer: 'در حال حاضر پرداخت در محل فعال نیست. تمام سفارش‌ها پیش از ارسال باید تسویه شوند.' },
          { question: 'چگونه سایز مناسب را انتخاب کنم؟', answer: 'در صفحه هر محصول راهنمای سایز موجود است. در صورت تردید با پشتیبانی تماس بگیرید تا راهنمایی تخصصی دریافت کنید.' },
          { question: 'آیا می‌توانم سفارش را لغو کنم؟', answer: 'تا قبل از ارسال محصول امکان لغو وجود دارد. پس از ارسال، تنها طبق شرایط مرجوعی می‌توانید درخواست بازگشت دهید.' },
          { question: 'شرایط مرجوعی کالا چیست؟', answer: 'تا ۷ روز پس از تحویل، محصول استفاده‌نشده با برچسب اصلی قابل مرجوعی است. جزئیات در صفحه «بازگشت وجه» آمده است.' },
          { question: 'اگر محصول معیوب دریافت کنم چه کنم؟', answer: 'ظرف ۴۸ ساعت تصویر آسیب را برای پشتیبانی ارسال کنید. تعویض رایگان یا بازگشت وجه انجام می‌شود.' },
          { question: 'چگونه وضعیت سفارش را پیگیری کنم؟', answer: 'پس از ورود به حساب، در بخش «سفارشات» وضعیت لحظه‌ای سفارش قابل مشاهده است. همچنین پیامک اطلاع‌رسانی ارسال می‌شود.' },
          { question: 'آیا کد تخفیف دارید؟', answer: 'بله. کدهای تخفیف فصلی و مناسبتی از طریق خبرنامه و شبکه‌های اجتماعی اعلام می‌شوند.' },
          { question: 'آیا محصولات اورجینال هستند؟', answer: 'تمام محصولات NadStore تولید اختصاصی یا تأمین‌شده از منابع معتبر هستند و پیش از ارسال کنترل کیفیت می‌شوند.' },
          { question: 'آیا ارسال به شهرستان دارید؟', answer: 'بله. ارسال به تمام استان‌های ایران از طریق پست پیشتاز و تیپاکس انجام می‌شود.' },
          { question: 'ساعات پاسخگویی پشتیبانی چیست؟', answer: 'شنبه تا پنج‌شنبه از ساعت ۹ تا ۱۸. ایمیل‌ها حداکثر ظرف ۲۴ ساعت پاسخ داده می‌شوند.' },
          { question: 'آیا امکان خرید عمده وجود دارد؟', answer: 'بله. برای همکاری عمده‌فروشی از طریق فرم تماس یا ایمیل با موضوع «همکاری» درخواست خود را ثبت کنید.' },
          { question: 'چگونه حساب کاربری بسازم؟', answer: 'از صفحه ورود، گزینه «ساخت حساب» را انتخاب کنید. ثبت‌نام با شماره موبایل و رمز عبور انجام می‌شود.' },
        ],
      },
    },
    newsletter: {
      title: 'عضویت در خبرنامه NadStore',
      subtitle: 'برای دریافت اخبار کالکشن‌های جدید عضو شوید.',
      button: 'عضویت',
      placeholder: 'ایمیل شما...',
    },
    admin: {
      title: 'پنل مدیریت',
      panelLabel: 'پنل مدیریت',
      logout: 'خروج',
      lightMode: 'حالت روشن',
      loading: 'در حال بارگذاری...',
      nav: {
        dashboard: 'داشبورد',
        products: 'محصولات',
        categories: 'دسته‌بندی‌ها',
        orders: 'سفارش‌ها',
        users: 'کاربران',
        discounts: 'کدهای تخفیف',
        promoBanners: 'پوسترهای تبلیغاتی',
        settings: 'تنظیمات',
        pages: 'محتوای صفحات',
      },
      dashboard: {
        title: 'داشبورد',
        subtitle: 'خلاصه عملکرد فروشگاه',
        refresh: 'بروزرسانی',
        weeklyRevenue: 'درآمد ۷ روز اخیر',
        orderStatus: 'وضعیت سفارش‌ها',
        financialSummary: 'خلاصه مالی',
        noSales: 'هنوز فروشی ثبت نشده',
        noData: 'داده‌ای موجود نیست',
        ordersLabel: 'سفارش',
      },
      products: {
        title: 'محصولات',
        subtitle: 'مدیریت محصولات فروشگاه',
        add: 'افزودن محصول',
        searchPlaceholder: 'جستجوی محصول...',
        allCategories: 'همه دسته‌بندی‌ها',
        selectCategory: 'انتخاب دسته‌بندی',
        sortNewest: 'جدیدترین',
        sortPriceAsc: 'قیمت: کم به زیاد',
        sortPriceDesc: 'قیمت: زیاد به کم',
        search: 'جستجو',
        empty: 'محصولی یافت نشد',
        modalAdd: 'افزودن محصول',
        modalEdit: 'ویرایش محصول',
        save: 'ذخیره محصول',
        update: 'بروزرسانی',
        featured: 'محصول ویژه',
        featuredBadge: 'ویژه',
        normalBadge: 'عادی',
        mainImage: 'اصلی',
        addImage: 'افزودن تصویر',
        slug: 'شناسه (slug)',
        status: 'وضعیت',
        statusDraft: 'پیش‌نویس',
        statusActive: 'فعال',
        statusArchived: 'آرشیو',
        shortDesc: 'توضیح کوتاه',
        fullDesc: 'توضیحات کامل',
        category: 'دسته‌بندی',
        productType: 'نوع محصول',
        typeSimple: 'ساده',
        typeVariable: 'چند واریانت',
        price: 'قیمت',
        stock: 'موجودی',
        generateVariants: 'تولید واریانت‌ها',
        variantsHint: 'محورهای واریانت را انتخاب و تولید کنید.',
        variantTitle: 'عنوان',
        emptyVariants: 'واریانتی وجود ندارد',
        tabGeneral: 'عمومی',
        tabVariants: 'واریانت‌ها',
        tabMedia: 'تصاویر',
      },
      categories: {
        title: 'دسته‌بندی‌ها',
        subtitle: 'مدیریت دسته‌بندی محصولات',
        add: 'افزودن دسته‌بندی',
        empty: 'دسته‌بندی‌ای یافت نشد',
        modalAdd: 'افزودن دسته‌بندی',
        modalEdit: 'ویرایش دسته‌بندی',
        save: 'ذخیره',
        update: 'بروزرسانی',
        selectImage: 'انتخاب تصویر',
      },
      orders: {
        title: 'سفارش‌ها',
        subtitle: 'مدیریت سفارشات',
        searchPlaceholder: 'جستجوی سفارش...',
        allStatuses: 'همه وضعیت‌ها',
        filter: 'فیلتر',
        empty: 'سفارشی یافت نشد',
        viewReceipt: 'مشاهده رسید',
        approve: 'تایید',
        reject: 'رد',
      },
      users: {
        title: 'کاربران',
        subtitle: 'مدیریت کاربران',
        empty: 'کاربری یافت نشد',
        roleAdmin: 'ادمین',
        roleUser: 'کاربر',
        demote: 'حذف ادمین',
      },
      discounts: {
        title: 'کدهای تخفیف',
        subtitle: 'مدیریت کدهای تخفیف',
        add: 'کد تخفیف جدید',
        empty: 'کد تخفیفی ثبت نشده',
        loading: 'در حال بارگذاری...',
        modalTitle: 'کد تخفیف جدید',
        create: 'ایجاد کد تخفیف',
        active: 'فعال',
        expired: 'منقضی',
        inactive: 'غیرفعال',
        deactivate: 'غیرفعال کردن',
        delete: 'حذف',
        noExpiry: 'بدون تاریخ انقضا',
        percentOff: '٪ تخفیف',
        fixedOff: 'تومان تخفیف',
      },
      promoBanners: {
        title: 'پوسترهای تبلیغاتی',
        subtitle: 'اسلایدر پوستر زیر کاروسل صفحه اصلی',
        add: 'افزودن پوستر',
        uploadHint: 'پوستر جدید را آپلود کنید. نسبت تصویر افقی (۲۱:۹) توصیه می‌شود.',
        titlePlaceholder: 'عنوان (alt) — اختیاری',
        empty: 'پوستری ثبت نشده',
        loading: 'در حال بارگذاری...',
        active: 'فعال',
        inactive: 'غیرفعال',
        activate: 'فعال',
        deactivate: 'غیرفعال',
        delete: 'حذف',
        moveUp: 'بالا',
        moveDown: 'پایین',
        uploadSuccess: 'پوستر اضافه شد',
        saved: 'ذخیره شد',
        deleted: 'پوستر حذف شد',
        confirmDelete: 'حذف شود؟',
      },
      settings: {
        title: 'تنظیمات',
        subtitle: 'تنظیمات فروشگاه',
        tabs: {
          identity: 'هویت فروشگاه',
          payment: 'پرداخت',
          contact: 'تماس و شبکه‌ها',
          shipping: 'ارسال و سفارش',
          sms: 'پیامک',
          seo: 'سئو',
        },
        identity: {
          shopName: 'نام فروشگاه',
          shopSlogan: 'شعار فروشگاه',
          shopDescription: 'توضیحات فروشگاه',
          logo: 'لوگو',
          heroImage: 'تصویر هیرو (صفحه اصلی)',
          favicon: 'فاویکون',
          upload: 'آپلود تصویر',
          change: 'تغییر تصویر',
        },
        payment: {
          method: 'روش پرداخت',
          cardToCard: 'کارت به کارت',
          zarinpal: 'زرین‌پال',
          both: 'هر دو',
          bankCard: 'شماره کارت',
          bankOwner: 'نام صاحب کارت',
          merchantId: 'شناسه پذیرنده زرین‌پال',
        },
        contact: {
          phone: 'تلفن تماس',
          email: 'ایمیل',
          address: 'آدرس',
          instagram: 'اینستاگرام',
          telegram: 'تلگرام',
          whatsapp: 'واتساپ',
          enamadLabel: 'کد نماد اعتماد (اینماد)',
          enamadHint: 'کد HTML دریافتی از enamad.ir را اینجا قرار دهید. پس از ذخیره، نماد در فوتر سایت نمایش داده می‌شود.',
          enamadPreview: 'پیش‌نمایش نماد اعتماد',
        },
        shipping: {
          standardCost: 'هزینه ارسال (تومان)',
          freeFrom: 'ارسال رایگان از (تومان)',
          minOrder: 'حداقل مبلغ سفارش (تومان)',
        },
        sms: { enabled: 'فعال‌سازی پیامک', provider: 'سرویس‌دهنده', apiKey: 'کلید API' },
        seo: { metaTitle: 'عنوان سئو', metaDescription: 'توضیحات سئو' },
        save: 'ذخیره تنظیمات',
        saving: 'در حال ذخیره...',
        saved: 'تنظیمات ذخیره شد',
        loading: 'در حال بارگذاری...',
        uploadSuccess: 'تصویر آپلود شد',
      },
      pages: {
        title: 'محتوای صفحات',
        subtitle: 'ویرایش صفحات درباره ما، تماس، قوانین و...',
        save: 'ذخیره محتوا',
        saving: 'در حال ذخیره...',
        saved: 'محتوا ذخیره شد',
        preview: 'مشاهده در سایت',
        lastUpdated: 'تاریخ آخرین بروزرسانی',
        tabs: {
          about: 'درباره ما',
          contact: 'تماس با ما',
          terms: 'قوانین و مقررات',
          privacy: 'حریم خصوصی',
          refund: 'بازگشت وجه',
          faq: 'سوالات متداول',
        },
        addSection: 'افزودن بخش',
        addFaq: 'افزودن سوال',
        remove: 'حذف',
      },
      orderStatuses: {
        pending: { label: 'در انتظار', cls: 'bg-yellow-100 text-yellow-800' },
        paid: { label: 'پرداخت شده', cls: 'bg-blue-100 text-blue-800' },
        shipped: { label: 'ارسال شده', cls: 'bg-purple-100 text-purple-800' },
        delivered: { label: 'تحویل داده شده', cls: 'bg-green-100 text-green-800' },
        cancelled: { label: 'لغو شده', cls: 'bg-card text-muted' },
      },
      common: {
        cancel: 'انصراف',
        save: 'ذخیره',
        search: 'جستجو',
        filter: 'فیلتر',
        edit: 'ویرایش',
        delete: 'حذف',
        nameRequired: 'نام الزامی است',
        codeValueRequired: 'کد و مقدار الزامی‌اند',
      },
    },
  },
  api: { baseUrl: 'api/v1' },
};
