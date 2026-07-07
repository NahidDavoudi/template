export type ImageSize = 'large' | 'medium' | 'thumb';

export interface ImageVariant {
  urls?: Partial<Record<ImageSize, string>>;
  image_large_url?: string;
  image_medium_url?: string;
  image_thumb_url?: string;
  url?: string;
  image_url?: string;
  poster_image?: string;
  main_image?: string;
  is_main?: boolean;
  id?: number;
  alt_text?: string;
  sort_order?: number;
}

export interface VariantAxisValue {
  id: number;
  value: string;
  label: string;
  swatch_hex?: string;
}

export interface VariantAxis {
  type_slug: string;
  type_name: string;
  input_type: string;
  values: VariantAxisValue[];
}

export interface ProductVariant {
  id: number;
  title: string;
  sku: string;
  price: number;
  sale_price: number | null;
  is_default?: boolean;
  is_active?: boolean;
  inventory?: { quantity: number };
  attribute_values?: { id: number; type_slug: string; value: string }[];
}

export interface ProductAttribute {
  type_name: string;
  custom_value?: string;
  value_value?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  is_active: number | boolean;
  is_featured: number | boolean;
  category_id: number;
  category_name: string;
  category_slug: string;
  main_image: string;
  main_image_medium?: string;
  main_image_thumb?: string;
  images: ImageVariant[];
  short_description?: string;
  description?: string;
  attributes?: ProductAttribute[];
  variant_axes?: VariantAxis[];
  variants?: ProductVariant[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
  image_url: string;
  poster_image?: string;
  poster_image_medium?: string;
  poster_image_thumb?: string;
  main_image?: string;
  images?: ImageVariant[];
}

export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  qty: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
  stock: number | null;
  is_active: boolean;
  subtotal: number;
  variant_title: string;
  sku: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  [key: string]: unknown;
}

export interface OrderItemInput {
  product_id: number;
  variant_id?: number | null;
  qty?: number;
  price?: number;
  name?: string;
}

export interface Order {
  id?: number;
  order_number?: string;
  number?: string;
  total?: number;
  status?: string;
  payment_method?: string;
  items?: OrderItemInput[];
  created_at?: string;
  customer_name?: string;
  customer_phone?: string;
  address?: string;
  cancel_reason?: string;
  receipt_url?: string;
  [key: string]: unknown;
}

export interface User {
  id: number | string;
  name?: string;
  phone?: string;
  email?: string;
  role: 'admin' | 'user' | string;
}

export interface Address {
  id?: number;
  title?: string;
  receiver?: string;
  receiver_name?: string;
  phone?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  is_default?: boolean;
  [key: string]: unknown;
}

export interface Discount {
  id: number;
  code: string;
  type: 'percent' | 'fixed' | string;
  value: number;
  active?: boolean;
  expires_at?: string | null;
  min_order?: number;
  usage_limit?: number;
  used_count?: number;
  [key: string]: unknown;
}

export interface PromoBanner {
  id: number;
  title?: string;
  image_url: string;
  is_active?: boolean;
  sort_order?: number;
  [key: string]: unknown;
}

export interface Enamad {
  href: string;
  logoUrl: string;
  code?: string;
}

export interface ProductListFilters {
  featured?: number | boolean;
  category?: string;
  category_id?: number;
  q?: string;
  sort?: 'price_asc' | 'price_desc' | string;
  limit?: number;
  [key: string]: unknown;
}

export interface ProductListResponse {
  data: Product[];
}

export interface DashboardStats {
  products?: number;
  ordersToday?: number;
  lowStock?: number;
  pending?: number;
  totalOrders?: number;
  totalRevenue?: number;
  totalUsers?: number;
  [key: string]: unknown;
}

export interface RevenuePoint {
  date?: string;
  day?: string;
  revenue?: number;
  total?: number;
  [key: string]: unknown;
}

export interface StatusCount {
  status: string;
  count: number;
}
