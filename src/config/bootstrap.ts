import { appConfig, type AppConfig } from './appConfig';
import { defaultStoreConfig, type StoreConfig } from './storeConfig';
import { deepMerge } from '../lib/utils/deepMerge';

function clone<T>(value: T): T {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}

export const storeConfig: StoreConfig = clone(defaultStoreConfig);

let _runtime: AppConfig = appConfig;

type ConfigListener = () => void;
const _listeners = new Set<ConfigListener>();

export function subscribeConfig(listener: ConfigListener): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function emit() {
  _listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      /* noop */
    }
  });
}

export function initConfig(): void {
  _runtime = {
    ...appConfig,
    app: { ...appConfig.app, name: storeConfig.name },
    api: { ...appConfig.api, ...storeConfig.api },
  };
}

export function cfg(): AppConfig {
  return _runtime;
}

export interface RemoteSettings {
  shop_name?: string;
  shop_slogan?: string;
  shop_description?: string;
  shop_logo?: string;
  shop_logo_medium?: string;
  shop_logo_thumb?: string;
  shop_favicon?: string;
  shop_favicon_medium?: string;
  shop_favicon_thumb?: string;
  shop_hero_image?: string;
  shop_hero_image_medium?: string;
  shop_hero_image_thumb?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
  social_instagram?: string;
  min_order_amount?: number | null;
  bank_card?: string;
  bank_owner?: string;
  payment_method?: string;
  zarinpal_merchant_id?: string;
  shipping_free_from?: number | null;
  shipping_standard_cost?: number | null;
  enamad?: { href: string; logoUrl: string; code?: string } | null;
  legal_content?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export function mergeStoreSettings(remote: RemoteSettings | null | undefined): StoreConfig {
  if (!remote || typeof remote !== 'object') return storeConfig;

  if (remote.shop_name) {
    storeConfig.name = remote.shop_name;
    storeConfig.hero.title = remote.shop_name;
  }
  if (remote.shop_slogan) {
    storeConfig.hero.subtitle = remote.shop_slogan;
    storeConfig.texts.footer.tagline = remote.shop_slogan;
  }
  if (remote.legal_content && typeof remote.legal_content === 'object') {
    deepMerge(storeConfig.texts.legal as unknown as Record<string, unknown>, remote.legal_content as Record<string, unknown>);
  }
  if (remote.shop_description) {
    storeConfig.texts.legal.about.intro = remote.shop_description;
  }
  if (remote.shop_logo) {
    storeConfig.logo = remote.shop_logo;
    storeConfig.logoVariants = {
      large: remote.shop_logo,
      medium: remote.shop_logo_medium || remote.shop_logo,
      thumb: remote.shop_logo_thumb || remote.shop_logo,
    };
  }
  if (remote.shop_favicon) {
    storeConfig.favicon = remote.shop_favicon;
    storeConfig.faviconVariants = {
      large: remote.shop_favicon,
      medium: remote.shop_favicon_medium || remote.shop_favicon,
      thumb: remote.shop_favicon_thumb || remote.shop_favicon,
    };
  } else if (remote.shop_logo) {
    storeConfig.favicon = remote.shop_logo;
    storeConfig.faviconVariants = storeConfig.logoVariants;
  }
  if (remote.shop_hero_image) {
    storeConfig.hero.image = remote.shop_hero_image;
    storeConfig.hero.imageVariants = {
      large: remote.shop_hero_image,
      medium: remote.shop_hero_image_medium || remote.shop_hero_image,
      thumb: remote.shop_hero_image_thumb || remote.shop_hero_image,
    };
  }
  if (remote.contact_phone) storeConfig.texts.legal.contact.phone.value = remote.contact_phone;
  if (remote.contact_email) storeConfig.texts.legal.contact.email.value = remote.contact_email;
  if (remote.contact_address) storeConfig.texts.legal.contact.address.value = remote.contact_address;
  if (remote.social_instagram) storeConfig.texts.footer.social = remote.social_instagram;
  if (remote.min_order_amount != null) storeConfig.shipping.minOrder = Number(remote.min_order_amount);
  if (remote.bank_card) storeConfig.payment.cardNumber = remote.bank_card;
  if (remote.bank_owner) storeConfig.payment.cardOwner = remote.bank_owner;
  if (remote.payment_method) storeConfig.payment.method = remote.payment_method;
  if (remote.zarinpal_merchant_id) storeConfig.payment.zarinpalMerchantId = remote.zarinpal_merchant_id;
  if (remote.shipping_free_from != null) storeConfig.shipping.freeFrom = Number(remote.shipping_free_from);
  if (remote.shipping_standard_cost != null) storeConfig.shipping.standardCost = Number(remote.shipping_standard_cost);

  if (remote.enamad?.href && remote.enamad?.logoUrl) {
    storeConfig.texts.footer.enamad = remote.enamad;
  } else if (Object.prototype.hasOwnProperty.call(remote, 'enamad') && !remote.enamad) {
    storeConfig.texts.footer.enamad = null;
  }

  _runtime = {
    ..._runtime,
    app: { ..._runtime.app, name: storeConfig.name },
    api: { ..._runtime.api, ...storeConfig.api },
  };

  emit();
  return storeConfig;
}
