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

const aestheticSlugMap: Record<string, string> = {
  minimalist: 'easy-does-it',
  'easy-does-it': 'easy-does-it',
  skater: 'touch-grass',
  'touch-grass': 'touch-grass',
  tech: 'just-a-chill-guy',
  'just-a-chill-guy': 'just-a-chill-guy',
  hypebeast: 'iykyk',
  iykyk: 'iykyk',
  athleisure: 'athleisure',
  'performance-ish': 'athleisure',
};

const aestheticNameMap: Record<string, string> = {
  'easy-does-it': 'EASY DOES IT',
  'touch-grass': 'TOUCH GRASS',
  'just-a-chill-guy': 'JUST A CHILL GUY',
  iykyk: 'IYKYK',
  athleisure: 'PERFORMANCE-ISH',
};

export function getCategoryForProductType(productType: string): { name: string; slug: string } {
  const normalized = productType.trim().toLowerCase().replace(/\s+/g, ' ');

  if (normalized === 'shoes' || normalized.includes('footwear')) {
    return { name: 'Shoes', slug: 'shoes' };
  }
  if (normalized === 'tops' || normalized.startsWith('tops -')) {
    return { name: 'Tops', slug: 'tops' };
  }
  if (normalized === 'bottoms' || normalized.startsWith('bottoms -')) {
    return { name: 'Bottoms', slug: 'bottoms' };
  }
  if (normalized === 'jackets' || normalized.startsWith('outerwear -')) {
    return { name: 'Jackets', slug: 'jackets' };
  }
  if (normalized === 'bags' || normalized === 'accessories - bags') {
    return { name: 'Bags', slug: 'bags' };
  }
  if (normalized === 'accessories' || normalized.startsWith('accessories -')) {
    return { name: 'Accessories', slug: 'accessories' };
  }

  return { name: 'Uncategorized', slug: 'uncategorized' };
}

export function mapShopifyProductToProduct(sp: ShopifyProduct): Product {
  const normalizedTags = sp.tags.map(tag => tag.trim().toLowerCase());

  // Aesthetic is controlled by one recognized product tag. Untagged products
  // remain in All Products without being assigned to an unrelated aesthetic.
  const matchedTag = normalizedTags.find(tag => tag in aestheticSlugMap) || '';
  const aestheticSlug = aestheticSlugMap[matchedTag] || '';
  const aesthetic = aestheticNameMap[aestheticSlug] || 'Unassigned';

  // Brand comes directly from Shopify's Vendor field.
  const brandSlug = sp.vendor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  // Category comes from Shopify's custom Product type field.
  const category = getCategoryForProductType(sp.productType);

  // Extract sizes from variants
  const sizes = sp.variants.edges.map(v => {
    const sizeOption = v.node.selectedOptions.find(o => o.name.toLowerCase() === 'size');
    return sizeOption ? sizeOption.value : v.node.title;
  });

  // New Arrivals / What's New is controlled by the exact "new" tag.
  const isNew = normalizedTags.includes('new');
  const lowStock = sp.variants.edges.some(v => (v.node.quantityAvailable ?? 0) < 5 && v.node.quantityAvailable > 0);

  // Sale is controlled by variant pricing, not by a product tag. A product is
  // on sale when at least one variant's Compare-at price exceeds its Price.
  const currentPrice = parseFloat(sp.priceRange.minVariantPrice.amount);
  const saleCompareAtPrices = sp.variants.edges.flatMap(({ node }) => {
    const variantPrice = parseFloat(node.price.amount);
    const compareAtPrice = node.compareAtPrice ? parseFloat(node.compareAtPrice.amount) : null;
    return compareAtPrice !== null && compareAtPrice > variantPrice ? [compareAtPrice] : [];
  });
  const originalPrice = saleCompareAtPrices.length > 0
    ? Math.min(...saleCompareAtPrices)
    : null;

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
    category: category.name,
    categorySlug: category.slug,
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
