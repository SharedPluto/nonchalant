import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://nonchalantstore.com';
const SITE_NAME = 'NonChalant';
const CONTENT_DATE = '2026-11-21T00:00:00.000Z';
const DEFAULT_IMAGE = `${SITE_URL}/assets/logo-wide.png`;

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  throw new Error('dist/index.html is missing. Run Vite before pre-rendering.');
}

function configFromSource(name) {
  const source = fs.readFileSync(path.join(ROOT, 'src/lib/shopify/client.ts'), 'utf8');
  return source.match(new RegExp(`${name}\\s*=\\s*'([^']+)'`))?.[1];
}

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN
  || process.env.VITE_SHOPIFY_STORE_DOMAIN
  || configFromSource('SHOPIFY_STORE_DOMAIN');
const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN
  || process.env.VITE_SHOPIFY_STOREFRONT_TOKEN
  || configFromSource('SHOPIFY_STOREFRONT_TOKEN');

if (!storeDomain || !storefrontToken) {
  throw new Error('Shopify Storefront configuration is required for pre-rendering.');
}

async function storefront(query, variables = {}) {
  const response = await fetch(`https://${storeDomain}/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`Shopify returned HTTP ${response.status}.`);
  const payload = await response.json();
  if (payload.errors) throw new Error(`Shopify GraphQL error: ${JSON.stringify(payload.errors)}`);
  return payload.data;
}

const PRODUCT_QUERY = `
query PrerenderProducts($after: String) {
  products(first: 100, after: $after) {
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id title handle description updatedAt vendor productType tags
        seo { title description }
        priceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText width height }
        images(first: 5) { edges { node { url altText width height } } }
        variants(first: 100) {
          edges {
            node {
              id title availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              selectedOptions { name value }
            }
          }
        }
      }
    }
  }
}`;

const BLOG_QUERY = `
query PrerenderBlogs {
  blogs(first: 20) {
    edges {
      node {
        handle title
        articles(first: 50) {
          edges {
            node {
              id title handle excerpt content contentHtml publishedAt tags
              author { name }
              image { url altText }
              seo { title description }
            }
          }
        }
      }
    }
  }
}`;

async function fetchCatalogue() {
  const products = [];
  let after = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const data = await storefront(PRODUCT_QUERY, { after });
    const connection = data.products;
    products.push(...connection.edges.map(edge => edge.node));
    hasNextPage = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }
  return products;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function plainText(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function description(value) {
  const text = plainText(value);
  return text.length <= 160 ? text : `${text.slice(0, 159).replace(/\s+\S*$/, '')}…`;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function categoryFor(productType) {
  const normalized = productType.trim().toLowerCase().replace(/\s+/g, ' ');
  if (normalized === 'shoes' || normalized.includes('footwear')) return { name: 'Shoes', slug: 'shoes' };
  if (normalized === 'tops' || normalized.startsWith('tops -')) return { name: 'Tops', slug: 'tops' };
  if (normalized === 'bottoms' || normalized.startsWith('bottoms -')) return { name: 'Bottoms', slug: 'bottoms' };
  if (normalized === 'jackets' || normalized.startsWith('outerwear -')) return { name: 'Jackets', slug: 'jackets' };
  if (normalized === 'bags' || normalized === 'accessories - bags') return { name: 'Bags', slug: 'bags' };
  if (normalized === 'accessories' || normalized.startsWith('accessories -')) return { name: 'Accessories', slug: 'accessories' };
  return { name: 'Uncategorized', slug: 'uncategorized' };
}

const categoryContent = {
  shoes: 'Explore sneakers and footwear available from NonChalant in Singapore. The selection brings together everyday pairs, archival designs, collaborations, and statement releases. Compare available sizes, variant pricing, and availability on each product page.',
  tops: 'Browse T-shirts, jerseys, and other tops curated by NonChalant for Singapore. Discover graphic pieces, understated staples, sportswear, and collaborative designs with current sizing, SGD pricing, and stock information.',
  bottoms: 'Shop pants and shorts selected to work with the store’s sneakers, tops, and outerwear. Find relaxed everyday options and directional streetwear pieces, with size-specific availability and pricing on every listing.',
  jackets: 'Discover jackets and outerwear at NonChalant Singapore, including track tops and layers from the current streetwear and sportswear catalogue. Product pages provide sizes, SGD pricing, descriptions, and related pieces.',
  bags: 'Browse bags and carry accessories connecting functional everyday pieces with the brands represented across NonChalant. Visit each listing for catalogue details, current availability, and Singapore delivery information.',
  accessories: 'Complete your rotation with socks, collectibles, and smaller pieces from streetwear and creative brands. Each listing links to current pricing, product details, availability, and related items.',
};

function jsonLd(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo.png`,
    sameAs: ['https://www.instagram.com/thenonchalantstore'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@nonchalantstore.com',
      telephone: '+65 94898482',
      areaServed: 'SG',
    },
  };
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: `${SITE_URL}${item.path}`,
    })),
  };
}

function priceOf(product) {
  return Number(product.priceRange.minVariantPrice.amount);
}

function money(product) {
  const price = priceOf(product);
  const currency = product.priceRange.minVariantPrice.currencyCode || 'SGD';
  return `${currency} ${Number.isInteger(price) ? price.toFixed(2) : price.toFixed(2)}`;
}

function inStock(product) {
  return product.variants.edges.some(edge => edge.node.availableForSale);
}

function imageOf(product) {
  return product.featuredImage?.url || product.images.edges[0]?.node.url || DEFAULT_IMAGE;
}

function shopifyImage(url, width) {
  if (!url.includes('cdn.shopify.com')) return url;
  const parsed = new URL(url);
  parsed.searchParams.set('width', String(width));
  return parsed.toString();
}

const PRODUCT_IMAGE_WIDTHS = [400, 600, 640, 800, 1200, 1600];
const PRODUCT_IMAGE_SIZES = '(min-width: 1280px) 640px, (min-width: 768px) 50vw, calc(100vw - 48px)';
const CARD_IMAGE_WIDTHS = [400, 600, 800];
const CARD_IMAGE_SIZES = '(max-width: 640px) calc(50vw - 30px), (max-width: 1280px) 25vw, 220px';

function shopifySrcSet(url, widths) {
  return widths.map(width => `${shopifyImage(url, width)} ${width}w`).join(', ');
}

function nav() {
  return `<nav class="nc-seo-nav" aria-label="Primary"><a href="/">NonChalant</a><a href="/shop">Shop</a><a href="/about">About</a><a href="/blog">Journal</a></nav>`;
}

function productCard(product, index = 0) {
  const category = categoryFor(product.productType);
  const image = imageOf(product);
  return `<article class="nc-seo-card"><a href="/product/${encodeURIComponent(product.handle)}"><img src="${escapeHtml(shopifyImage(image, 400))}" srcset="${escapeHtml(shopifySrcSet(image, CARD_IMAGE_WIDTHS))}" sizes="${CARD_IMAGE_SIZES}" alt="${escapeHtml(product.featuredImage?.altText || product.title)}" width="600" height="750" loading="${index < 6 ? 'eager' : 'lazy'}" fetchpriority="${index < 2 ? 'high' : 'auto'}" decoding="async"><h2>${escapeHtml(product.title)}</h2></a><p>${escapeHtml(product.vendor)} · ${escapeHtml(category.name)}</p><p>${escapeHtml(money(product))}</p></article>`;
}

function layout(body) {
  return `${nav()}${body}<footer class="nc-seo-footer"><p>Singapore delivery: SGD 5 flat rate; free for orders above SGD 150.</p><p>© ${new Date().getFullYear()} NonChalant. All rights reserved.</p></footer>`;
}

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const sitemapEntries = [];
const renderedRoutes = [];

function renderPage({ route, title, metaDescription, body, image = DEFAULT_IMAGE, type = 'website', noindex = false, schemas = [], lastmod = CONTENT_DATE, sitemap = true, preloads = [] }) {
  const canonical = `${SITE_URL}${route === '/' ? '/' : route}`;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description(metaDescription))}" />`,
    `<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow'}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description(metaDescription))}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="${type}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description(metaDescription))}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ];
  if (type === 'product' && image.includes('cdn.shopify.com')) {
    const preload = shopifyImage(image, 800);
    tags.push(`<link rel="preload" as="image" href="${escapeHtml(preload)}" imagesrcset="${escapeHtml(shopifySrcSet(image, PRODUCT_IMAGE_WIDTHS))}" imagesizes="${PRODUCT_IMAGE_SIZES}" fetchpriority="high" />`);
  }
  for (const preload of preloads) {
    tags.push(`<link rel="preload" as="image" href="${escapeHtml(preload.href)}"${preload.srcset ? ` imagesrcset="${escapeHtml(preload.srcset)}"` : ''}${preload.sizes ? ` imagesizes="${escapeHtml(preload.sizes)}"` : ''}${preload.media ? ` media="${escapeHtml(preload.media)}"` : ''} fetchpriority="high" />`);
  }
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    tags.push(`<meta name="google-site-verification" content="${escapeHtml(process.env.GOOGLE_SITE_VERIFICATION)}" />`);
  }
  const allSchemas = [...schemas, organizationSchema()];
  tags.push(...allSchemas.map(schema => `<script type="application/ld+json">${jsonLd(schema)}</script>`));
  tags.push(`<style>
    #root .nc-seo-nav,#root .nc-seo-footer{max-width:1200px;margin:auto;padding:24px;display:flex;gap:20px;flex-wrap:wrap;font:14px/1.5 Arial,sans-serif}#root .nc-seo-nav{border-bottom:1px solid #ddd}#root .nc-seo-footer{border-top:1px solid #ddd;display:block;margin-top:40px}#root main.nc-seo-main{max-width:1200px;margin:auto;padding:32px 24px;font:16px/1.65 Arial,sans-serif;color:#171717}#root .nc-seo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:24px}#root .nc-seo-card img{width:100%;height:auto;aspect-ratio:4/5;object-fit:contain}#root .nc-seo-card h2{font-size:16px}#root .nc-seo-hero{max-width:760px;margin-bottom:36px}#root .nc-seo-product{display:grid;grid-template-columns:minmax(0,1fr);gap:32px}@media(min-width:760px){#root .nc-seo-product{grid-template-columns:1fr 1fr}}#root .nc-seo-product>img{width:100%;height:auto}#root a{color:inherit}#root img{background:#f6f6f4}
  </style>`);

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/i, '')
    .replace(/<meta\s+name="robots"[^>]*>/i, '')
    .replace(/<link\s+rel="canonical"[^>]*>/i, '')
    .replace('</head>', `${tags.map(tag => tag.startsWith('<meta name="google-site-verification"') ? tag : tag.replace(/^<(title|meta|link|script|style)/, '<$1 data-prerender')).join('\n')}\n</head>`)
    .replace(/<div id="root"><\/div>/, `<div id="root">${layout(body)}</div>`);

  const output = route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html);
  renderedRoutes.push(route);
  if (sitemap && !noindex) sitemapEntries.push({ route, lastmod });
}

console.log('Fetching the live Shopify catalogue for pre-rendering…');
const [products, blogData] = await Promise.all([
  fetchCatalogue(),
  storefront(BLOG_QUERY),
]);
if (products.length === 0) throw new Error('The live catalogue is empty; refusing to publish an empty pre-render.');

const liveHandles = new Set(products.map(product => product.handle));
const latestProductUpdate = products.reduce((latest, product) => product.updatedAt > latest ? product.updatedAt : latest, CONTENT_DATE);
const articles = blogData.blogs.edges.flatMap(edge => edge.node.articles.edges.map(articleEdge => ({
  ...articleEdge.node,
  blogHandle: edge.node.handle,
  blogTitle: edge.node.title,
})));
const newProducts = products.filter(product => product.tags.some(tag => tag.toLowerCase() === 'new')).slice(0, 10);
const shopProducts = [...products].sort((a, b) =>
  Number(b.tags.some(tag => tag.toLowerCase() === 'new')) - Number(a.tags.some(tag => tag.toLowerCase() === 'new'))
);

const legacySource = fs.readFileSync(path.join(ROOT, 'src/data/legacyProductRedirects.ts'), 'utf8');
const legacyModule = ts.transpileModule(legacySource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const legacy = await import(`data:text/javascript;base64,${Buffer.from(legacyModule).toString('base64')}`);
const verifiedRedirects = legacy.legacyProductRedirects.filter(entry => {
  if (!liveHandles.has(entry.verifiedLiveHandle)) {
    throw new Error(`Legacy redirect target is not live: ${entry.verifiedLiveHandle}`);
  }
  return true;
});

renderPage({
  route: '/',
  title: 'Nonchalant | Style On Your Own Terms',
  metaDescription: 'Shop authenticated streetwear and sneakers in Singapore. Discover Nike, Jordan, Palace, KITH, and other curated brands at NonChalant.',
  lastmod: latestProductUpdate,
  schemas: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE_URL }],
  preloads: [{
    href: '/assets/aesthetic-iykyk-480.webp',
    srcset: [480, 768, 1152].map(width => `/assets/aesthetic-iykyk-${width}.webp ${width}w`).join(', '),
    sizes: '100vw',
    media: '(max-width: 767px)',
  }, {
    href: '/assets/logo-560.webp',
    srcset: [320, 480, 560, 640].map(width => `/assets/logo-${width}.webp ${width}w`).join(', '),
    sizes: '(min-width: 1024px) 460px, (min-width: 768px) 380px, 280px',
  }],
  body: `<main class="nc-seo-main"><section class="nc-seo-hero"><h1>Streetwear & sneakers in Singapore</h1><p>NonChalant is a Singapore-based streetwear store curating sneakers, clothing, accessories, collaborations, and collectible pieces. Every listing links to current SGD pricing, available options, and stock information.</p><p>Shop verified products from the brands represented in our live catalogue, with Singapore delivery and support from our local team. Style on your own terms.</p><p><a href="/shop">Shop all ${products.length} products</a></p></section><h2>Featured new arrivals</h2><div class="nc-seo-grid">${newProducts.map(productCard).join('')}</div><h2>Browse categories</h2><ul>${Object.entries(categoryContent).map(([slug, value], index) => `<li><a href="/categories/${slug}">${['Shoes','Tops','Bottoms','Jackets','Bags','Accessories'][index]}</a></li>`).join('')}</ul></main>`,
});

renderPage({
  route: '/shop',
  title: 'Shop All Streetwear & Sneakers in Singapore | NonChalant',
  metaDescription: `Browse all ${products.length} streetwear, sneaker, clothing, and accessory products at NonChalant Singapore, with live SGD pricing and availability.`,
  lastmod: latestProductUpdate,
  preloads: shopProducts.slice(0, 2).map(product => {
    const image = imageOf(product);
    return {
      href: shopifyImage(image, 400),
      srcset: shopifySrcSet(image, CARD_IMAGE_WIDTHS),
      sizes: CARD_IMAGE_SIZES,
    };
  }),
  body: `<main class="nc-seo-main"><section class="nc-seo-hero"><h1>Shop all products</h1><p>Browse ${products.length} products from the live NonChalant catalogue. Filter by aesthetic, brand, category, size, availability, new arrivals, or sale in the interactive shop.</p></section><div class="nc-seo-grid">${shopProducts.map(productCard).join('')}</div></main>`,
});

renderPage({
  route: '/about',
  title: 'About NonChalant | Streetwear in Singapore',
  metaDescription: 'Learn about NonChalant, our curated approach to streetwear in Singapore, our authenticity standards, and how to contact our team.',
  body: `<main class="nc-seo-main"><section class="nc-seo-hero"><h1>Born from the streets. Curated for the few.</h1><p>NonChalant is a premium streetwear marketplace built for those who know. We connect you with sought-after drops, rare collabs, and timeless pieces without the noise or queues. Style on your own terms.</p><h2>Authenticity guaranteed</h2><p>Every item is verified and every brand is official. Our team checks each piece so you can shop with confidence.</p><h2>Curated selection</h2><p>We handpick each drop, collaboration, and restock, giving you a focused route through streetwear rather than an endless catalogue.</p><h2>Contact NonChalant</h2><p>Email <a href="mailto:support@nonchalantstore.com">support@nonchalantstore.com</a> or call +65 94898482.</p></section></main>`,
});

const staticPages = [
  ['/shipping', 'Singapore Shipping | NonChalant', 'Shipping & delivery', 'NonChalant delivers within Singapore for a SGD 5 flat rate, with free shipping for orders above SGD 150.', 'Delivery is available throughout Singapore. Orders below or exactly SGD 150 ship for a flat SGD 5; orders above SGD 150 qualify for free shipping.'],
  ['/returns', 'Returns & Exchanges | NonChalant Singapore', 'Returns & exchanges', 'Read the NonChalant returns and exchange process and contact our Singapore support team for order assistance.', 'Contact support@nonchalantstore.com with your order number and reason for return. Our team will explain the available return or exchange options for your order.'],
  ['/faq', 'Frequently Asked Questions | NonChalant', 'Frequently asked questions', 'Find answers about NonChalant orders, Singapore delivery, returns, sizing, authenticity, and customer support.', 'Get help with orders, delivery, tracking, returns, sizing, and product authenticity. For further assistance, email support@nonchalantstore.com.'],
  ['/terms', 'Terms of Service | NonChalant', 'Terms of service', 'Read the terms that apply when browsing and purchasing from the NonChalant Singapore storefront.', 'These terms govern use of the NonChalant website and purchases made through the store. Contact our support team if you need clarification.'],
  ['/privacy', 'Privacy Policy | NonChalant', 'Privacy policy', 'Learn how NonChalant handles personal information, order details, analytics, and customer support communications.', 'This policy explains the information used to provide the NonChalant storefront, process orders, support customers, and improve the shopping experience.'],
  ['/authenticity', 'Our Authenticity Standard | NonChalant', 'Authenticity at NonChalant', 'Learn how NonChalant approaches product verification and authenticity across its curated streetwear catalogue.', 'Every item is checked before it reaches you. Our authenticity process supports confident shopping across sneakers, streetwear, accessories, and collectibles.'],
  ['/size-guide', 'Size Guide | NonChalant Singapore', 'Size guide', 'Use the NonChalant size guide and open individual product listings for current size options and availability.', 'Sizing varies by brand and product. Use this guide as a starting point, then review the available sizes and product-specific details on each listing.'],
];
for (const [route, title, heading, metaDescription, copy] of staticPages) {
  renderPage({
    route, title, metaDescription,
    body: `<main class="nc-seo-main"><section class="nc-seo-hero"><h1>${heading}</h1><p>${copy}</p><p><a href="/shop">Continue shopping</a> or email <a href="mailto:support@nonchalantstore.com">support@nonchalantstore.com</a>.</p></section></main>`,
  });
}

for (const product of products) {
  const category = categoryFor(product.productType);
  const route = `/product/${product.handle}`;
  const related = products.filter(candidate => candidate.handle !== product.handle && (candidate.vendor === product.vendor || categoryFor(candidate.productType).slug === category.slug)).slice(0, 4);
  const productDescription = plainText(product.description) || `${product.title} by ${product.vendor}, available from NonChalant in Singapore.`;
  const image = imageOf(product);
  const price = priceOf(product);
  const currency = product.priceRange.minVariantPrice.currencyCode || 'SGD';
  const variants = product.variants.edges.map(edge => edge.node);
  renderPage({
    route,
    title: `${product.title} | Buy in Singapore — NonChalant`,
    metaDescription: `Shop ${product.title}: ${productDescription} Available from ${product.vendor} in Singapore at ${money(product)}.`,
    image,
    type: 'product',
    lastmod: product.updatedAt,
    schemas: [
      {
        '@context': 'https://schema.org', '@type': 'Product',
        name: product.title, description: description(productDescription), image: [image],
        brand: { '@type': 'Brand', name: product.vendor },
        sku: variants[0]?.id.split('/').pop() || product.handle,
        offers: {
          '@type': 'Offer', url: `${SITE_URL}${route}`, price: price.toFixed(2), priceCurrency: currency,
          availability: `https://schema.org/${inStock(product) ? 'InStock' : 'OutOfStock'}`,
          itemCondition: 'https://schema.org/NewCondition',
        },
      },
      breadcrumbSchema([
        { name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' },
        { name: category.name, path: `/categories/${category.slug}` }, { name: product.title, path: route },
      ]),
    ],
    body: `<main class="nc-seo-main"><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/shop">Shop</a> / <a href="/categories/${category.slug}">${category.name}</a></nav><div class="nc-seo-product"><img src="${escapeHtml(shopifyImage(image, 800))}" srcset="${escapeHtml(shopifySrcSet(image, PRODUCT_IMAGE_WIDTHS))}" sizes="${PRODUCT_IMAGE_SIZES}" alt="${escapeHtml(product.featuredImage?.altText || product.title)}" width="1200" height="1500" loading="eager" fetchpriority="high"><section><p><a href="/brands/${slugify(product.vendor)}">${escapeHtml(product.vendor)}</a></p><h1>${escapeHtml(product.title)}</h1><p><strong>${escapeHtml(money(product))}</strong></p><p>${inStock(product) ? 'Available to order' : 'Currently out of stock'}</p><p>${escapeHtml(productDescription)}</p><h2>Available options</h2><ul>${variants.map(variant => `<li>${escapeHtml(variant.title)} — ${variant.availableForSale ? 'in stock' : 'out of stock'}</li>`).join('')}</ul><p>Delivery within Singapore is SGD 5, or free for orders above SGD 150.</p><p><a href="/categories/${category.slug}">Complete the fit with more ${escapeHtml(category.name.toLowerCase())}</a></p></section></div><section><h2>Related products</h2><div class="nc-seo-grid">${related.map(product => productCard(product, 99)).join('')}</div></section></main>`,
  });
}

const brandGroups = new Map();
for (const product of products) {
  const slug = slugify(product.vendor);
  if (!brandGroups.has(slug)) brandGroups.set(slug, { name: product.vendor, products: [] });
  brandGroups.get(slug).products.push(product);
}
for (const [slug, group] of [...brandGroups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const route = `/brands/${slug}`;
  const categories = [...new Set(group.products.map(product => categoryFor(product.productType).name))].sort();
  const latest = group.products.reduce((value, product) => product.updatedAt > value ? product.updatedAt : value, CONTENT_DATE);
  const intro = `Shop ${group.name} at NonChalant in Singapore. Browse ${categories.join(', ').toLowerCase()} currently listed from ${group.name}. Every product page includes current SGD pricing, available options, catalogue details, and stock status.`;
  renderPage({
    route,
    title: `${group.name} Streetwear & Sneakers in Singapore | NonChalant`,
    metaDescription: `${intro} ${group.products.length} products currently listed.`,
    lastmod: latest,
    schemas: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Brands', path: '/shop' }, { name: group.name, path: route }])],
    body: `<main class="nc-seo-main"><section class="nc-seo-hero"><h1>${escapeHtml(group.name)}</h1><p>${escapeHtml(intro)}</p><p>${group.products.length} products</p></section><div class="nc-seo-grid">${group.products.map(productCard).join('')}</div></main>`,
  });
}

for (const [slug, intro] of Object.entries(categoryContent)) {
  const items = products.filter(product => categoryFor(product.productType).slug === slug);
  const route = `/categories/${slug}`;
  const name = { shoes: 'Shoes', tops: 'Tops', bottoms: 'Bottoms', jackets: 'Jackets', bags: 'Bags', accessories: 'Accessories' }[slug];
  const latest = items.reduce((value, product) => product.updatedAt > value ? product.updatedAt : value, CONTENT_DATE);
  renderPage({
    route,
    title: `${name} | Streetwear Singapore — NonChalant`,
    metaDescription: `${intro} ${items.length} products currently listed.`,
    lastmod: latest,
    schemas: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Categories', path: '/shop' }, { name, path: route }])],
    body: `<main class="nc-seo-main"><section class="nc-seo-hero"><h1>${name}</h1><p>${intro}</p><p>${items.length} products</p></section><div class="nc-seo-grid">${items.map(productCard).join('')}</div></main>`,
  });
}

const latestArticleUpdate = articles.reduce((latest, article) => {
  const date = article.updatedAt || article.publishedAt;
  return date > latest ? date : latest;
}, CONTENT_DATE);
renderPage({
  route: '/blog',
  title: 'NonChalant Journal | Streetwear Stories from Singapore',
  metaDescription: 'Read the NonChalant Journal for streetwear stories, product context, releases, culture, and news from Singapore.',
  lastmod: latestArticleUpdate,
  body: `<main class="nc-seo-main"><section class="nc-seo-hero"><h1>Journal</h1><p>Drops, culture, product context, and stories from the world of streetwear. New articles published in Shopify will appear here after the next site build.</p></section>${articles.length ? `<div class="nc-seo-grid">${articles.map(article => `<article class="nc-seo-card"><a href="/blog/${article.handle}">${article.image ? `<img src="${escapeHtml(article.image.url)}" alt="${escapeHtml(article.image.altText || article.title)}" width="800" height="600" loading="lazy">` : ''}<h2>${escapeHtml(article.title)}</h2></a><p>${escapeHtml(article.excerpt || description(article.content))}</p></article>`).join('')}</div>` : '<p>No journal posts have been published yet.</p>'}</main>`,
});

for (const article of articles) {
  const route = `/blog/${article.handle}`;
  renderPage({
    route,
    title: article.seo?.title ? `${article.seo.title} | NonChalant` : `${article.title} | NonChalant Journal`,
    metaDescription: article.seo?.description || article.excerpt || article.content,
    image: article.image?.url || DEFAULT_IMAGE,
    type: 'article',
    lastmod: article.updatedAt || article.publishedAt,
    schemas: [{
      '@context': 'https://schema.org', '@type': 'Article', headline: article.title,
      datePublished: article.publishedAt, dateModified: article.updatedAt || article.publishedAt,
      author: { '@type': 'Person', name: article.author?.name || SITE_NAME },
      image: article.image ? [article.image.url] : undefined,
      mainEntityOfPage: `${SITE_URL}${route}`,
    }],
    body: `<main class="nc-seo-main"><article><p><a href="/blog">Back to Journal</a></p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.author?.name || SITE_NAME)} · ${escapeHtml(article.publishedAt.slice(0, 10))}</p>${article.image ? `<img src="${escapeHtml(article.image.url)}" alt="${escapeHtml(article.image.altText || article.title)}" width="1200" height="675">` : ''}<div>${article.contentHtml}</div></article></main>`,
  });
}

renderPage({
  route: '/admin/waitlist',
  title: 'Waitlist Administration | NonChalant',
  metaDescription: 'NonChalant waitlist administration.',
  noindex: true,
  sitemap: false,
  body: '<main class="nc-seo-main"><h1>Waitlist administration</h1><p>This page is restricted from search indexing.</p></main>',
});

const notFoundTemplate = template
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>Page Not Found | NonChalant</title>')
  .replace(/<meta\s+name="description"[^>]*>/i, '<meta name="description" content="The requested NonChalant page could not be found." />')
  .replace(/<meta\s+name="robots"[^>]*>/i, '<meta name="robots" content="noindex,follow" />')
  .replace(/<link\s+rel="canonical"[^>]*>/i, '')
  .replace(/<div id="root"><\/div>/, `<div id="root">${layout('<main class="nc-seo-main"><h1>Page not found</h1><p>The page may have moved, or the product is no longer available.</p><p><a href="/shop">Browse the shop</a></p></main>')}</div>`);
fs.writeFileSync(path.join(DIST, '404.html'), notFoundTemplate);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map(entry => `  <url><loc>${SITE_URL}${entry.route === '/' ? '/' : entry.route}</loc><lastmod>${entry.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nDisallow: /api/\nDisallow: /checkout/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, 'seo-manifest.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  productionDomain: SITE_URL,
  productCount: products.length,
  articleCount: articles.length,
  renderedRouteCount: renderedRoutes.length + 1,
  sitemapUrlCount: sitemapEntries.length,
  verifiedLegacyRedirects: verifiedRedirects,
  unresolvedLegacyProductUrls: legacy.unresolvedLegacyProductUrls,
}, null, 2)}\n`);

console.log(`Pre-rendered ${renderedRoutes.length + 1} routes (${products.length} products, ${articles.length} articles).`);
console.log(`Generated sitemap with ${sitemapEntries.length} canonical URLs.`);
console.log(`Verified legacy redirects: ${verifiedRedirects.length}; unresolved demo URLs: ${legacy.unresolvedLegacyProductUrls.length}.`);
