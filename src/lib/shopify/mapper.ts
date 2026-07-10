import type { Product } from '@/types';

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange: {
    minVariantPrice: { amount: string } | null;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: { amount: string };
        compareAtPrice: { amount: string } | null;
        availableForSale: boolean;
        quantityAvailable: number;
        selectedOptions: Array<{ name: string; value: string }>;
      };
    }>;
  };
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
}

export function mapShopifyProductToProduct(sp: ShopifyProduct): Product {
  // Extract aesthetic from tags
  const aestheticTags = ['minimalist', 'skater', 'tech', 'hypebeast'];
  const aestheticSlug = sp.tags.find(t => aestheticTags.includes(t.toLowerCase())) || 'minimalist';
  const aestheticMap: Record<string, string> = {
    minimalist: 'Minimalist',
    skater: 'Skater',
    tech: 'Tech',
    hypebeast: 'Hypebeast',
  };
  const aesthetic = aestheticMap[aestheticSlug] || 'Minimalist';

  // Build brand slug from vendor
  const brandSlug = sp.vendor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  // Extract sizes from variants
  const sizes = sp.variants.edges.map(v => {
    const sizeOption = v.node.selectedOptions.find(o => o.name.toLowerCase() === 'size');
    return sizeOption ? sizeOption.value : v.node.title;
  });

  // Check tags for status
  const isNew = sp.tags.some(t => t.toLowerCase() === 'new');
  const lowStock = sp.variants.edges.some(v => (v.node.quantityAvailable ?? 0) < 5 && v.node.quantityAvailable > 0);

  // Compare at price for sale
  const compareAtPrice = sp.compareAtPriceRange.minVariantPrice?.amount;
  const currentPrice = parseFloat(sp.priceRange.minVariantPrice.amount);
  const originalPrice = compareAtPrice && parseFloat(compareAtPrice) > currentPrice ? parseFloat(compareAtPrice) : null;

  // Images
  const images = [sp.featuredImage?.url].filter(Boolean) as string[];
  if (sp.images?.edges) {
    sp.images.edges.forEach(img => {
      if (img.node.url && !images.includes(img.node.url)) {
        images.push(img.node.url);
      }
    });
  }
  // Fallback if no images
  if (images.length === 0) {
    images.push('/assets/prod-nike-af1.jpg');
  }

  return {
    id: sp.id.split('/').pop() || sp.handle,
    handle: sp.handle,
    name: sp.title,
    brand: sp.vendor,
    brandSlug,
    category: sp.productType || 'Accessories',
    categorySlug: (sp.productType || 'accessories').toLowerCase().replace(/\s+/g, '-'),
    aesthetic,
    aestheticSlug,
    price: currentPrice,
    originalPrice,
    images,
    sizes,
    description: sp.description || `${sp.title} from ${sp.vendor}. Premium quality streetwear.`,
    inStock: sp.variants.edges.some(v => v.node.availableForSale),
    lowStock,
    isNew,
    sku: sp.variants.edges[0]?.node.id.split('/').pop() || sp.handle,
  };
}

export function getVariantIdForSize(shopifyProduct: ShopifyProduct, size: string): string | null {
  const variant = shopifyProduct.variants.edges.find(v => {
    const opt = v.node.selectedOptions.find(o => o.name.toLowerCase() === 'size');
    return opt?.value === size;
  });
  return variant?.node.id || null;
}
