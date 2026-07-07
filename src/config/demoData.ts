import type { Product, Category } from '../types';

const IMG = (n: number): string => `/assets/images/products/p${n}.jpg`;

const categories: Category[] = [
  { id: 1, name: 'پوشاک مردانه', slug: 'men', product_count: 3, image_url: IMG(1) },
  { id: 2, name: 'پوشاک زنانه', slug: 'women', product_count: 3, image_url: IMG(2) },
  { id: 3, name: 'اکسسوری', slug: 'accessories', product_count: 2, image_url: IMG(3) },
  { id: 4, name: 'کفش', slug: 'shoes', product_count: 2, image_url: IMG(4) },
];

interface MakeProductArgs {
  id: number;
  name: string;
  slug: string;
  price: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  featured?: boolean;
  stock?: number;
  imageNum?: number;
}

function makeProduct({
  id,
  name,
  slug,
  price,
  categoryId,
  categoryName,
  categorySlug,
  featured = false,
  stock = 12,
  imageNum = id,
}: MakeProductArgs): Product {
  const img = IMG(imageNum);
  return {
    id,
    name,
    slug,
    price,
    sale_price: null,
    stock,
    is_active: 1,
    is_featured: featured ? 1 : 0,
    category_id: categoryId,
    category_name: categoryName,
    category_slug: categorySlug,
    main_image: img,
    images: [{ id: id * 10, url: img, image_url: img, is_main: true }],
    short_description: `${name} — محصول نمایشی NadStore`,
    description: `${name} یکی از محصولات نمایشی قالب NadStore است. این قالب برای نمایش ظاهر و تجربه کاربری فروشگاه آنلاین طراحی شده و بدون اتصال به سرور واقعی کار می‌کند.`,
    attributes: [
      { type_name: 'جنس', custom_value: 'پنبه مرغوب', value_value: 'پنبه مرغوب' },
      { type_name: 'رنگ', custom_value: 'مشکی', value_value: 'مشکی' },
    ],
    variant_axes: [
      {
        type_slug: 'size',
        type_name: 'سایز',
        input_type: 'text',
        values: [
          { id: 101, value: 'S', label: 'S' },
          { id: 102, value: 'M', label: 'M' },
          { id: 103, value: 'L', label: 'L' },
        ],
      },
    ],
    variants: [
      {
        id: id * 100 + 1,
        title: 'M',
        sku: `ND-${String(id).padStart(3, '0')}-M`,
        price,
        sale_price: null,
        is_default: true,
        is_active: true,
        inventory: { quantity: stock },
        attribute_values: [{ id: 102, type_slug: 'size', value: 'M' }],
      },
    ],
  };
}

const products: Product[] = [
  makeProduct({ id: 1, name: 'تی‌شرت اورسایز مردانه', slug: 'oversize-tee-men', price: 890000, categoryId: 1, categoryName: 'پوشاک مردانه', categorySlug: 'men', featured: true, imageNum: 1 }),
  makeProduct({ id: 2, name: 'هودی اسپرت مردانه', slug: 'sport-hoodie-men', price: 1450000, categoryId: 1, categoryName: 'پوشاک مردانه', categorySlug: 'men', featured: true, imageNum: 5 }),
  makeProduct({ id: 3, name: 'شلوار جین اسلیم', slug: 'slim-jeans-men', price: 1280000, categoryId: 1, categoryName: 'پوشاک مردانه', categorySlug: 'men', imageNum: 6 }),
  makeProduct({ id: 4, name: 'بلوز یقه‌گرد زنانه', slug: 'round-neck-blouse', price: 760000, categoryId: 2, categoryName: 'پوشاک زنانه', categorySlug: 'women', featured: true, imageNum: 2 }),
  makeProduct({ id: 5, name: 'مانتو کوتاه زنانه', slug: 'short-manto', price: 1890000, categoryId: 2, categoryName: 'پوشاک زنانه', categorySlug: 'women', featured: true, imageNum: 7 }),
  makeProduct({ id: 6, name: 'دامن پلیسه', slug: 'pleated-skirt', price: 980000, categoryId: 2, categoryName: 'پوشاک زنانه', categorySlug: 'women', imageNum: 8 }),
  makeProduct({ id: 7, name: 'کوله‌پشتی چرمی', slug: 'leather-backpack', price: 2150000, categoryId: 3, categoryName: 'اکسسوری', categorySlug: 'accessories', featured: true, imageNum: 3 }),
  makeProduct({ id: 8, name: 'کلاه بیسبال', slug: 'baseball-cap', price: 420000, categoryId: 3, categoryName: 'اکسسوری', categorySlug: 'accessories', imageNum: 9 }),
  makeProduct({ id: 9, name: 'کفش اسپرت سفید', slug: 'white-sneakers', price: 2350000, categoryId: 4, categoryName: 'کفش', categorySlug: 'shoes', featured: true, imageNum: 4 }),
  makeProduct({ id: 10, name: 'کفش چرم رسمی', slug: 'formal-leather-shoes', price: 3100000, categoryId: 4, categoryName: 'کفش', categorySlug: 'shoes', imageNum: 10 }),
];

export const demoData = { categories, products };
