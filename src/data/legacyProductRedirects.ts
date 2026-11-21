export type LegacyProductRedirect = {
  source: string;
  destination: string;
  verifiedLiveHandle: string;
};

// Add an entry only after destination handle resolves in the live Shopify
// catalogue. The pre-renderer also verifies every entry and fails the build if
// a target disappears, preventing redirects to unrelated or missing products.
export const legacyProductRedirects: LegacyProductRedirect[] = [];

// The old sitemap's /product/1 through /product/18 URLs referenced removed demo
// products (air-force-1-07, samba-og, 550, and others). None resolves in the
// current catalogue, so they remain intentionally unmapped rather than sending
// visitors and search engines to unrelated products.
export const unresolvedLegacyProductUrls = Array.from(
  { length: 18 },
  (_, index) => `/product/${index + 1}`,
);
