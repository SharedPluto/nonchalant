# NonChalant SEO foundation implementation

Date started: 21 November 2026  
Branch: `fix/seo-foundation`  
Production domain: `https://nonchalantstore.com`

## Scope and release safety

This change is limited to routing, pre-rendering, crawlability, metadata, structured data, internal links, and measured performance improvements. It does not change branding, prices, product data, checkout, payments, DNS, Shopify settings, or Instagram content.

Work is isolated on the branch above. The pre-change commit is tagged `rollback/before-seo-foundation-2026-11-21`. No production deployment is part of this preview implementation.

## Baseline recorded before edits

- Live `/`, `/shop`, `/about`, and `/product/1` each returned HTTP 200 and the same 1,169-byte application shell.
- Those responses contained the same title, zero H1 elements, no canonical, and no JSON-LD.
- The app used `HashRouter`; Vite used a relative asset base.
- The static sitemap contained `nonchalant.co`, numeric demo product URLs, filter URLs, and hard-coded 2025 dates.
- The live Shopify Storefront catalogue returned 86 products on 21 November 2026. This replaces the brief's older count of 84 as the generation baseline.
- All 18 legacy numeric product records were demo products whose handles are absent from the live catalogue. No numeric-to-live redirect target will be invented.
- PageSpeed Insights API requests from the sandbox failed at the TLS connection stage. Local Lighthouse/mobile-browser measurements will be used for the preview, and public PageSpeed Insights remains a release check.

## Implementation decisions

### Pre-rendering

The existing host is a static Vercel deployment. The build will query Shopify and emit route-specific HTML after the normal Vite build. This supplies crawlable content without introducing a new application server. Catalogue and sitemap freshness require a rebuild/redeploy after Shopify changes.

The pre-rendered HTML is replaced by the interactive React application when JavaScript loads. With JavaScript disabled, the semantic pre-rendered content remains available.

### URL scheme

- Products: `/product/<shopify-handle>`
- Brands: `/brands/<vendor-slug>`
- Categories: `/categories/<category-slug>`
- Journal: existing `/blog` and `/blog/<article-handle>` routes are retained to avoid unnecessary URL churn.

Legacy `/#/...` links are migrated in the browser because URL fragments are never sent to the server and therefore cannot receive an HTTP 301.

### Indexation

Indexable pages receive self-referencing production canonicals. Shop filter/sort query combinations receive `noindex,follow` and a canonical to the relevant clean page. Sitemap entries exclude filter combinations and unavailable demo products.

### Sitemap dates

Product `lastmod` values come from Shopify `updatedAt`. Static page dates use the implementation date only when that page's rendered content changes. Journal dates come from Shopify article data.

### Redirect map

`src/data/legacyProductRedirects.ts` is the reviewed source of truth for numeric product redirects. Only mappings verified against a live Shopify handle may be enabled. The 18 removed demo products are recorded as unresolved, not redirected to unrelated items.

## Verification record

### Build and generated catalogue

Final preview verification used a clean install and `npm run build` in the isolated preview project.

- 125 routes rendered: 123 canonical sitemap pages, the `noindex` waitlist admin page, and `404.html`.
- 86 live products, 20 live brand pages, six category pages, and zero published journal articles.
- 123 unique titles and 123 unique meta descriptions.
- Product `lastmod` values use live Shopify `updatedAt` values.
- The sitemap contains no obsolete domain, query-filter URL, or numeric demo product URL.
- Route-level code splitting reduced the shared JavaScript bundle from 460 KB to 340 KB before compression. CSS fell from 155 KB to 105 KB before compression.
- Responsive Shopify images, WebP aesthetic panels, responsive WebP logos, a WebP paper texture, Latin-only font assets, and explicit image dimensions are included without changing the visual design.

### Static and HTTP crawl

`npm run test:seo` passed against the generated files and again against the production-like local HTTP server with Brotli compression and clean-route handling.

| Check | Result |
| --- | ---: |
| Live products | 86 |
| Sitemap URLs checked | 123 |
| Internal links crawled | 116 |
| Unique titles | 123 |
| Unique descriptions | 123 |
| Warnings | 0 |
| Failures | 0 |

The audit verifies HTTP/file status, non-empty route-specific root content, exactly one H1, canonical domain/path, valid JSON-LD, Product Offer price/currency/SKU, BreadcrumbList, Organization, sitemap dates/count, robots rules, internal links, About content, and all 86 products in the initial Shop HTML.

### Browser and no-JavaScript checks

All 23 automated browser assertions passed:

- Hydrated homepage title, canonical, one H1, Organization and WebSite schema.
- Direct Shop route, Sale toggle on/off, filter `noindex,follow`, and clean brand canonical.
- Jackets category filtering, Nike brand content, and landing-page schema.
- Clean product canonical plus Product and BreadcrumbList schema after hydration.
- Legacy hash-route migration to a clean history URL.
- Mobile Shop width: 375 px viewport and 375 px document width, with no horizontal overflow.
- About, all 86 Shop products, and Product content with JavaScript disabled.
- Zero browser runtime errors and zero failed resources.

The production-like HTTP server also returned real 404 responses for unknown routes and unresolved numeric demo URLs instead of serving homepage content.

### Performance evidence

The original baseline was measured on the live site with mobile Lighthouse. Final preview measurements used the same mobile/simulated-throttling settings, with Brotli enabled to match the production host. Public PageSpeed Insights could not be reached from the sandbox because its API failed during TLS negotiation, so these are local Lighthouse lab results rather than public PSI or field data.

| Route | Before score | Final score | Before LCP | Final LCP | Final CLS | Final TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 66 | 87 | 11.357 s | 3.722 s | 0.000 | 74 ms |
| `/shop` | 60 | 88 | 6.404 s | 3.479 s | 0.000 | 82 ms |
| Product | 55 | 87 | 9.661 s | 3.681 s | 0.000 | 118 ms |

The final run improved all three routes and eliminated the intermediate Shop CLS regression. **The LCP acceptance target of under 2.5 seconds is not yet met.** CLS meets the under-0.1 target. TBT is reported as a lab diagnostic, not as a substitute for INP; INP requires interaction/field verification. Public PSI and real-user Core Web Vitals remain release checks.

### Lint

Focused lint passes for the new routing, SEO, pre-render, verification, landing-page, image, and optimization modules. Full-repository lint still reports 43 legacy errors in existing files, chiefly explicit `any` and effect-setState findings. Those unrelated legacy errors were not hidden or mass-suppressed in this change.

### Preview and host-specific checks

- Isolated preview snapshot: `27ce5d7` (`SEO foundation preview`).
- The preview save returned a version ID, not a public URL. Production was not deployed or modified.
- Vercel's `vercel.json` contains explicit rewrites for generated route files rather than a catch-all homepage rewrite.
- Final Vercel preview/production status codes, Rich Results Test, public PSI, Search Console, and indexing checks require the relevant deployed URL/account and remain pending.

### Explicitly unmet or pending acceptance items

1. `/product/1` through `/product/18` cannot yet 301 to verified products. All 18 were removed demo records and their handles are absent from the live catalogue. They intentionally remain unmapped rather than redirecting to unrelated products. A verified source-to-live-handle map is required to complete this item.
2. LCP is improved but remains above 2.5 seconds on all three lab-tested routes; INP is not yet field-verified.
3. Search Console verification/submission, GA4 activation, public Rich Results, public PSI, and indexing require real account values and a deployed URL.
4. Writer-owned 100–300-word product copy and 200–300-word brand/category copy remain content work. Functional templates and unique factual starter copy are implemented.

## Remaining account/manual work

- Bryan supplies Google Search Console verification and GA4 Measurement ID; neither is guessed.
- Bryan submits the production sitemap and requests indexing after release.
- Bryan removes Shopify test/copy products and controls the public `myshopify.com` theme/robots settings.
- Bryan supplies final writer-owned homepage, brand/category, and expanded product copy.
- Bryan reviews the preview, approves production release, and places the post-release test order.
- Public production PageSpeed Insights, final host-level status checks, and Search Console indexing are post-release checks.
