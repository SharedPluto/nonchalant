import { useEffect } from 'react';
import { products, aesthetics, brands, categories } from '@/data/products';

const SITE_URL = 'https://nonchalant.co';

export function generateSitemapXml(): string {
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

export default function SitemapGenerator() {
  useEffect(() => {
    // Generate sitemap and inject it into the build
    const sitemap = generateSitemapXml();

    // Create a blob and link for download (in production, this would be built as static file)
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    // Store in session for potential download
    sessionStorage.setItem('nonchalant-sitemap', sitemap);

    return () => URL.revokeObjectURL(url);
  }, []);

  return null; // This is a utility component, doesn't render anything
}
