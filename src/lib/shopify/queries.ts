import { getShopifyClient, isShopifyConfigured } from './client';

// GraphQL fragments
const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    productType
    tags
    vendor
    variants(first: 20) {
      edges {
        node {
          id
          title
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          availableForSale
          quantityAvailable
          selectedOptions {
            name
            value
          }
        }
      }
    }
    images(first: 5) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    seo {
      title
      description
    }
    metafields(identifiers: [
      {namespace: "custom", key: "aesthetic"},
      {namespace: "custom", key: "is_new"},
      {namespace: "custom", key: "low_stock"}
    ]) {
      key
      value
    }
  }
`;

// Fetch all products
export async function fetchProducts(first: number = 50) {
  if (!isShopifyConfigured()) return null;
  const client = getShopifyClient();
  if (!client) return null;

  const { data, errors } = await client.request(`
    ${PRODUCT_FRAGMENT}
    query GetProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  `, { variables: { first } });

  if (errors) {
    console.error('Shopify fetchProducts error:', errors);
    return null;
  }

  return data?.products?.edges?.map((edge: any) => edge.node) || [];
}

// Fetch products by collection handle (for filtering by aesthetic/category)
export async function fetchProductsByCollection(handle: string, first: number = 50) {
  if (!isShopifyConfigured()) return null;
  const client = getShopifyClient();
  if (!client) return null;

  const { data, errors } = await client.request(`
    ${PRODUCT_FRAGMENT}
    query GetCollectionProducts($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        products(first: $first) {
          edges {
            node {
              ...ProductFields
            }
          }
        }
      }
    }
  `, { variables: { handle, first } });

  if (errors) {
    console.error('Shopify fetchProductsByCollection error:', errors);
    return null;
  }

  return data?.collection?.products?.edges?.map((edge: any) => edge.node) || [];
}

// Fetch single product by handle
export async function fetchProductByHandle(handle: string) {
  if (!isShopifyConfigured()) return null;
  const client = getShopifyClient();
  if (!client) return null;

  const { data, errors } = await client.request(`
    ${PRODUCT_FRAGMENT}
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        ...ProductFields
      }
    }
  `, { variables: { handle } });

  if (errors) {
    console.error('Shopify fetchProductByHandle error:', errors);
    return null;
  }

  return data?.product || null;
}

// Fetch collections (for aesthetics and categories)
export async function fetchCollections(first: number = 20) {
  if (!isShopifyConfigured()) return null;
  const client = getShopifyClient();
  if (!client) return null;

  const { data, errors } = await client.request(`
    query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
          }
        }
      }
    }
  `, { variables: { first } });

  if (errors) {
    console.error('Shopify fetchCollections error:', errors);
    return null;
  }

  return data?.collections?.edges?.map((edge: any) => edge.node) || [];
}

// Create a cart
export async function createCart(lines: { merchandiseId: string; quantity: number }[]) {
  if (!isShopifyConfigured()) return null;
  const client = getShopifyClient();
  if (!client) return null;

  const { data, errors } = await client.request(`
    mutation CreateCart($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      featuredImage {
                        url
                      }
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `, { variables: { lines } });

  if (errors) {
    console.error('Shopify createCart error:', errors);
    return null;
  }

  return data?.cartCreate?.cart || null;
}

// Add lines to existing cart
export async function addCartLines(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  if (!isShopifyConfigured()) return null;
  const client = getShopifyClient();
  if (!client) return null;

  const { data, errors } = await client.request(`
    mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      featuredImage {
                        url
                      }
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `, { variables: { cartId, lines } });

  if (errors) {
    console.error('Shopify addCartLines error:', errors);
    return null;
  }

  return data?.cartLinesAdd?.cart || null;
}

// Remove cart line
export async function removeCartLine(cartId: string, lineId: string) {
  if (!isShopifyConfigured()) return null;
  const client = getShopifyClient();
  if (!client) return null;

  const { data, errors } = await client.request(`
    mutation RemoveCartLine($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          lines(first: 50) {
            edges {
              node {
                id
                quantity
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `, { variables: { cartId, lineIds: [lineId] } });

  if (errors) {
    console.error('Shopify removeCartLine error:', errors);
    return null;
  }

  return data?.cartLinesRemove?.cart || null;
}

// Update cart line quantity
export async function updateCartLine(cartId: string, lineId: string, quantity: number) {
  if (!isShopifyConfigured()) return null;
  const client = getShopifyClient();
  if (!client) return null;

  const { data, errors } = await client.request(`
    mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 50) {
            edges {
              node {
                id
                quantity
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `, { variables: { cartId, lines: [{ id: lineId, quantity }] } });

  if (errors) {
    console.error('Shopify updateCartLine error:', errors);
    return null;
  }

  return data?.cartLinesUpdate?.cart || null;
}

// Get cart by ID
export async function fetchCart(cartId: string) {
  if (!isShopifyConfigured()) return null;
  const client = getShopifyClient();
  if (!client) return null;

  const { data, errors } = await client.request(`
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                    featuredImage {
                      url
                    }
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `, { variables: { cartId } });

  if (errors) {
    console.error('Shopify fetchCart error:', errors);
    return null;
  }

  return data?.cart || null;
}
