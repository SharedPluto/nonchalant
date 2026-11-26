import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');
const SITE_URL = 'https://nonchalantstore.com';
const BASE_URL = process.env.SEO_TEST_BASE_URL?.replace(/\/$/, '');
const failures = [];
const warnings = [];
const checkedRoutes = new Set();
const internalLinks = new Set(['/']);
const titleOwners = new Map();
const descriptionOwners = new Map();

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function routeFile(route) {
  return route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.slice(1), 'index.html');
}

async function getRoute(route) {
  if (BASE_URL) {
    const response = await fetch(`${BASE_URL}${route}`, { redirect: 'manual' });
    return { status: response.status, html: await response.text(), location: response.headers.get('location') };
  }
  const file = routeFile(route);
  return { status: fs.existsSync(file) ? 200 : 404, html: fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '', location: null };
}

function one(html, regex) {
  return html.match(regex)?.[1]?.trim() || '';
}

function recordDuplicate(map, value, route, label) {
  if (!value) return;
  if (map.has(value)) failures.push(`Duplicate ${label}: ${route} and ${map.get(value)}`);
  else map.set(value, route);
}

function inspectHtml(route, status, html) {
  assert(status === 200, `${route}: expected 200, received ${status}`);
  if (status !== 200) return;
  const title = one(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = one(html, /<meta\b[^>]*name="description"[^>]*content="([^"]*)"/i);
  const canonical = one(html, /<link\b[^>]*rel="canonical"[^>]*href="([^"]*)"/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  assert(title.length > 0, `${route}: missing title`);
  assert(metaDescription.length > 0, `${route}: missing meta description`);
  assert(h1Count === 1, `${route}: expected one H1, found ${h1Count}`);
  assert(canonical === `${SITE_URL}${route}`, `${route}: incorrect canonical ${canonical}`);
  assert(!html.includes('nonchalant.co'), `${route}: obsolete domain found`);
  assert(!/<div id="root"><\/div>/.test(html), `${route}: empty application shell`);
  assert((html.match(/<title\b/gi) || []).length === 1, `${route}: multiple title elements`);
  recordDuplicate(titleOwners, title, route, 'title');
  recordDuplicate(descriptionOwners, metaDescription, route, 'meta description');

  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const schema = JSON.parse(match[1]);
      assert(schema['@context'] === 'https://schema.org', `${route}: schema context missing`);
    } catch {
      failures.push(`${route}: invalid JSON-LD`);
    }
  }
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => JSON.parse(match[1]));
  assert(schemas.some(schema => schema['@type'] === 'Organization'), `${route}: Organization schema missing`);
  if (route.startsWith('/product/')) {
    const product = schemas.find(schema => schema['@type'] === 'Product');
    assert(Boolean(product), `${route}: Product schema missing`);
    assert(product?.offers?.priceCurrency === 'SGD', `${route}: Product currency is not SGD`);
    assert(Boolean(product?.offers?.price), `${route}: Product offer price missing`);
    assert(schemas.some(schema => schema['@type'] === 'BreadcrumbList'), `${route}: BreadcrumbList missing`);
    assert(Boolean(product?.sku), `${route}: Product SKU missing`);
  }
  if (route.startsWith('/blog/')) {
    const article = schemas.find(schema => schema['@type'] === 'Article');
    const ogImage = one(html, /<meta\b[^>]*property="og:image"[^>]*content="([^"]*)"/i);
    assert(Boolean(article), `${route}: Article schema missing`);
    assert(Boolean(article?.headline), `${route}: Article headline missing`);
    assert(Boolean(article?.author?.name), `${route}: Article author missing`);
    assert(!Number.isNaN(Date.parse(article?.datePublished)), `${route}: Article datePublished invalid`);
    assert(Array.isArray(article?.image) && article.image.length > 0, `${route}: Article image missing`);
    assert(article?.image?.[0] === ogImage, `${route}: OG image does not match Article hero`);
    assert(schemas.some(schema => schema['@type'] === 'BreadcrumbList'), `${route}: BreadcrumbList missing`);
  }
  if (route.startsWith('/brands/') || route.startsWith('/categories/')) {
    assert(schemas.some(schema => schema['@type'] === 'BreadcrumbList'), `${route}: BreadcrumbList missing`);
  }

  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) continue;
    if (href.startsWith('/')) internalLinks.add(href.split(/[?#]/)[0] || '/');
  }
  for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
    const src = match[1];
    if (src.startsWith('/')) {
      assert(fs.existsSync(path.join(DIST, src.slice(1))), `${route}: missing script asset ${src}`);
    }
  }
  for (const match of html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)) {
    const href = match[1];
    if (href.startsWith('/')) assert(fs.existsSync(path.join(DIST, href.slice(1))), `${route}: missing CSS asset ${href}`);
  }
}

const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'seo-manifest.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
const entries = [...sitemap.matchAll(/<url><loc>(.*?)<\/loc><lastmod>(.*?)<\/lastmod><\/url>/g)]
  .map(match => ({ url: match[1], lastmod: match[2], route: match[1].replace(SITE_URL, '') || '/' }));

assert(manifest.productCount === 86 || manifest.productCount > 0, 'Manifest product count is invalid');
assert(entries.length === manifest.sitemapUrlCount, 'Sitemap count does not match manifest');
assert(entries.filter(entry => entry.route.startsWith('/product/')).length === manifest.productCount, 'Sitemap product count does not match live catalogue count');
assert(entries.filter(entry => entry.route.startsWith('/blog/')).length === manifest.articleCount, 'Sitemap article count does not match published Markdown articles');
assert(!entries.some(entry => entry.route === '/blog/jordan-1-sizing-guide'), 'Unfinished Jordan guide must not be in the sitemap');
assert(!sitemap.includes('nonchalant.co'), 'Sitemap contains obsolete domain');
assert(!/<loc>[^<]*\?/.test(sitemap), 'Sitemap contains query-filter URLs');
assert(!/\/product\/\d+<\/loc>/.test(sitemap), 'Sitemap contains numeric demo product URLs');
assert(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), 'Robots sitemap URL is incorrect');
assert(robots.includes('Disallow: /api/'), 'Robots /api/ rule missing');
assert(robots.includes('Disallow: /checkout/'), 'Robots /checkout/ rule missing');

for (const entry of entries) {
  assert(entry.url.startsWith(`${SITE_URL}/`), `Non-production sitemap URL: ${entry.url}`);
  assert(!Number.isNaN(Date.parse(entry.lastmod)), `${entry.route}: invalid lastmod`);
  // Sitemap paths are generated from live handles, not user input.
  const result = await getRoute(entry.route);
  inspectHtml(entry.route, result.status, result.html);
  checkedRoutes.add(entry.route);
}

for (const route of [...internalLinks].sort()) {
  if (checkedRoutes.has(route) || route.startsWith('/assets/') || route === '/admin/waitlist') continue;
  // Clean URLs discovered in pre-rendered content must resolve too.
  const result = await getRoute(route);
  assert(result.status === 200, `Crawled internal link ${route}: expected 200, received ${result.status}`);
}

const about = await getRoute('/about');
assert(about.html.includes('Born from the streets.'), '/about: About copy is absent from initial HTML');
const shop = await getRoute('/shop');
assert((shop.html.match(/class="nc-seo-card"/g) || []).length === manifest.productCount, '/shop: initial HTML product count mismatch');

console.log(JSON.stringify({
  baseUrl: BASE_URL || 'filesystem',
  liveProductCount: manifest.productCount,
  sitemapUrlCount: entries.length,
  routesChecked: checkedRoutes.size,
  internalLinksCrawled: internalLinks.size,
  uniqueTitles: titleOwners.size,
  uniqueDescriptions: descriptionOwners.size,
  verifiedLegacyRedirectCount: manifest.verifiedLegacyRedirects.length,
  unresolvedLegacyDemoUrls: manifest.unresolvedLegacyProductUrls,
  warnings,
  failures,
}, null, 2));

if (failures.length > 0) process.exit(1);
console.log('SEO generation and crawl checks passed.');
