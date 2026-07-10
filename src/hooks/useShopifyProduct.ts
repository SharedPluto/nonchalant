import { useState, useEffect } from 'react';
import { getShopifyClient } from '@/lib/shopify/client';
import { mapShopifyProductToProduct, getVariantIdForSize } from '@/lib/shopify/mapper';
import type { Product } from '@/types';

const client = getShopifyClient();

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
      productType
      tags
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price { amount }
            compareAtPrice { amount }
            availableForSale
            quantityAvailable
            selectedOptions { name value }
          }
        }
      }
      featuredImage { url altText }
      images(first: 5) {
        edges { node { url altText } }
      }
    }
  }
`;

export function useShopifyProduct(handle: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) return;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const result = await client.request(PRODUCT_QUERY, { variables: { handle } });
        const shopifyProduct = result.data?.product;

        if (!shopifyProduct) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        const mappedProduct = mapShopifyProductToProduct(shopifyProduct);
        setProduct(mappedProduct);

        // Set default variant ID (first variant)
        const firstVariant = shopifyProduct.variants.edges[0]?.node;
        if (firstVariant) {
          setVariantId(firstVariant.id);
        }
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [handle]);

  const selectSize = (size: string) => {
    if (!product) return;
    
    // Find variant for this size
    // We need to re-fetch or have stored the Shopify product data
    // For now, we'll build the variant ID from the product handle + size
    // Actually, let me re-query to get the variant
    const requery = async () => {
      const result = await client.request(PRODUCT_QUERY, { variables: { handle: product.brandSlug + '-' + product.name.toLowerCase().replace(/['\s]+/g, '-').replace(/-+/g, '-') } });
      const sp = result.data?.product;
      if (sp) {
        const vid = getVariantIdForSize(sp, size);
        if (vid) setVariantId(vid);
      }
    };
    requery();
  };

  return { product, variantId, loading, error, selectSize };
}

// Fetch all products
const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          vendor
          productType
          tags
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                price { amount }
                compareAtPrice { amount }
                availableForSale
                quantityAvailable
                selectedOptions { name value }
              }
            }
          }
          featuredImage { url altText }
          images(first: 5) {
            edges { node { url altText } }
          }
        }
      }
    }
  }
`;

export function useShopifyProducts(first: number = 50) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const result = await client.request(PRODUCTS_QUERY, { variables: { first } });
        const edges = result.data?.products?.edges || [];
        const mapped = edges.map((e: any) => mapShopifyProductToProduct(e.node));
        setProducts(mapped);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [first]);

  return { products, loading, error };
}

// Fetch products by collection
const COLLECTION_QUERY = `
  query GetCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            vendor
            productType
            tags
            priceRange {
              minVariantPrice { amount currencyCode }
            }
            compareAtPriceRange {
              minVariantPrice { amount }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  price { amount }
                  compareAtPrice { amount }
                  availableForSale
                  quantityAvailable
                  selectedOptions { name value }
                }
              }
            }
            featuredImage { url altText }
            images(first: 5) {
              edges { node { url altText } }
            }
          }
        }
      }
    }
  }
`;

export function useShopifyCollection(handle: string, first: number = 50) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) return;

    async function fetch() {
      setLoading(true);
      try {
        const result = await client.request(COLLECTION_QUERY, { variables: { handle, first } });
        const edges = result.data?.collection?.products?.edges || [];
        const mapped = edges.map((e: any) => mapShopifyProductToProduct(e.node));
        setProducts(mapped);
      } catch (err) {
        setError('Failed to load collection');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [handle, first]);

  return { products, loading, error };
}

// Get variant ID for a product + size
export async function getVariantIdForProductSize(productHandle: string, size: string): Promise<string | null> {
  try {
    const result = await client.request(PRODUCT_QUERY, { variables: { handle: productHandle } });
    const shopifyProduct = result.data?.product;
    if (!shopifyProduct) return null;
    
    // Find variant matching the size
    const variant = shopifyProduct.variants.edges.find((v: any) => {
      const sizeOption = v.node.selectedOptions.find((o: any) => o.name.toLowerCase() === 'size');
      return sizeOption?.value === size;
    });
    
    return variant?.node?.id || null;
  } catch (err) {
    console.error('Error getting variant ID:', err);
    return null;
  }
}

// Fetch related products that share brand or aesthetic tags with the given product
// Uses client-side filtering since Shopify Storefront API doesn't support complex tag queries
export function useShopifyRelatedProducts(currentProductHandle: string | undefined, brandTag: string, aestheticTag: string, first: number = 50) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProductHandle) {
      setLoading(false);
      return;
    }

    async function fetch() {
      setLoading(true);
      try {
        const result = await client.request(PRODUCTS_QUERY, { variables: { first } });
        const edges = result.data?.products?.edges || [];
        const allProducts = edges.map((e: any) => mapShopifyProductToProduct(e.node));

        // Filter: products that share the brand OR aesthetic tag, excluding current product
        const related = allProducts
          .filter((p: Product) => {
            if (p.handle === currentProductHandle) return false;
            const brandMatch = p.brand.toLowerCase() === brandTag.toLowerCase();
            const aestheticMatch = p.aestheticSlug.toLowerCase() === aestheticTag.toLowerCase();
            return brandMatch || aestheticMatch;
          })
          .slice(0, 4);

        setProducts(related);
      } catch (err) {
        console.error('Error loading related products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [currentProductHandle, brandTag, aestheticTag, first]);

  return { products, loading };
}
