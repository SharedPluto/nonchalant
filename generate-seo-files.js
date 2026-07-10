import { writeFileSync } from 'fs';
import { products, aesthetics, brands, categories } from './src/data/products.ts';

const SITE_URL = 'https://nonchalant.co';
const now = new Date().toISOString();

const pages = [
  { url: '/', priority: '1.0' },
  { url: '/shop', priority: '0.9' },
  { url: '/about', priority: '0.7' },
];

// Aesthetic pages
aesthetics.forEach((a) => {
  pages.push({ url: `/shop?aesthetic=${a.slug}`, priority: '0.8' });
});

// Brand pages
brands.forEach((b) => {
  pages.push({ url: `/shop?brand=${b.slug}`, priority: '0.8' });
});

// Category pages
categories.forEach((c) => {
  pages.push({ url: `/shop?category=${c.slug}`, priority: '0.8' });
});

// Product pages
products.forEach((p) => {
  pages.push({ url: `/product/${p.id}`, priority: '0.6' });
});

const urls = pages.map(
  (page) => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`
).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

writeFileSync('./public/sitemap.xml', sitemap);
console.log('✅ sitemap.xml generated');

// robots.txt
const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Disallow
Disallow: /api/
Disallow: /checkout/
`;

writeFileSync('./public/robots.txt', robots);
console.log('✅ robots.txt generated');
