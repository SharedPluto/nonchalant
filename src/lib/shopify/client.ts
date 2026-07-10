import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Shopify Storefront API Configuration
// For client-side (public) access token, we need to use the Admin API endpoint with the private token
// since Shopify's new Headless channel uses shpat_ tokens for Storefront API access
const SHOPIFY_STORE_DOMAIN = 'nonchalantstore-store.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = 'c4d9cacf019e7fcd821d94f2278a180e';
const SHOPIFY_API_VERSION = '2025-01';

const client: ReturnType<typeof createStorefrontApiClient> = createStorefrontApiClient({
  storeDomain: SHOPIFY_STORE_DOMAIN,
  apiVersion: SHOPIFY_API_VERSION,
  publicAccessToken: SHOPIFY_STOREFRONT_TOKEN,
});

export function getShopifyClient() {
  return client;
}

export function isShopifyConfigured(): boolean {
  return true;
}

// Fallback to static data when Shopify is not configured
export function useShopifyOrStatic<T>(shopifyFn: () => Promise<T>, staticData: T): Promise<T> {
  if (isShopifyConfigured()) {
    return shopifyFn().catch(() => staticData);
  }
  return Promise.resolve(staticData);
}
