import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getShopifyClient } from '@/lib/shopify/client';
import type { Product } from '@/types';

interface ShopifyCartItem {
  product: Product;
  size: string;
  quantity: number;
  variantId: string;
  lineId?: string;
}

interface ShopifyCartState {
  items: ShopifyCartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isOpen: boolean;
  isLoading: boolean;
  lastAdded: string | null;

  addItem: (product: Product, size: string, variantId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
  syncWithShopify: () => Promise<void>;
}

const client = getShopifyClient();

export const useShopifyCartStore = create<ShopifyCartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isOpen: false,
      isLoading: false,
      lastAdded: null,

      addItem: async (product, size, variantId) => {
        const { items, cartId } = get();
        set({ isLoading: true });

        try {
          // Check if item already in cart
          const existing = items.find(i => i.product.id === product.id && i.size === size);

          if (existing) {
            // Update quantity via Shopify
            const newQty = Math.min(existing.quantity + 1, 5);
            if (cartId && client) {
              await client.request(`
                mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
                  cartLinesUpdate(cartId: $cartId, lines: $lines) {
                    cart { id checkoutUrl }
                  }
                }
              `, { variables: { cartId, lines: [{ id: existing.lineId, quantity: newQty }] } });
            }
            set({
              items: items.map(i =>
                i.product.id === product.id && i.size === size ? { ...i, quantity: newQty } : i
              ),
              lastAdded: product.id,
              isLoading: false,
            });
          } else {
            // Add new line to Shopify cart
            let newCartId = cartId;
            let checkoutUrl = get().checkoutUrl;

            if (!newCartId && client) {
              // Create new cart
              const result = await client.request(`
                mutation CreateCart($lines: [CartLineInput!]!) {
                  cartCreate(input: { lines: $lines }) {
                    cart { id checkoutUrl lines(first: 50) { edges { node { id merchandise { ... on ProductVariant { id } } } } } }
                    userErrors { field message }
                  }
                }
              `, { variables: { lines: [{ merchandiseId: variantId, quantity: 1 }] } });
              
              newCartId = result.data?.cartCreate?.cart?.id || null;
              checkoutUrl = result.data?.cartCreate?.cart?.checkoutUrl || null;
            } else if (client) {
              // Add to existing cart
              const result = await client.request(`
                mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
                  cartLinesAdd(cartId: $cartId, lines: $lines) {
                    cart { id checkoutUrl lines(first: 50) { edges { node { id merchandise { ... on ProductVariant { id } } } } } }
                    userErrors { field message }
                  }
                }
              `, { variables: { cartId: cartId!, lines: [{ merchandiseId: variantId, quantity: 1 }] } });
              
              checkoutUrl = result.data?.cartLinesAdd?.cart?.checkoutUrl || null;
            }

            // Get line ID from Shopify response
            let lineId: string | undefined;
            if (client && newCartId) {
              const cartResult = await client.request(`
                query GetCart($cartId: ID!) {
                  cart(id: $cartId) {
                    lines(first: 50) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
                  }
                }
              `, { variables: { cartId: newCartId } });
              
              const lines = cartResult.data?.cart?.lines?.edges || [];
              const matchingLine = lines.find((l: any) => 
                l.node.merchandise.id === variantId
              );
              lineId = matchingLine?.node.id;
            }

            set({
              items: [...items, { product, size, quantity: 1, variantId, lineId }],
              cartId: newCartId,
              checkoutUrl: checkoutUrl || get().checkoutUrl,
              lastAdded: product.id,
              isLoading: false,
            });
          }

          // Clear lastAdded after animation
          setTimeout(() => set({ lastAdded: null }), 1500);
        } catch (err) {
          console.error('Cart error:', err);
          set({ isLoading: false });
        }
      },

      removeItem: async (productId) => {
        const { items, cartId } = get();
        const item = items.find(i => i.product.id === productId);
        if (!item) return;

        set({ isLoading: true });
        try {
          if (cartId && item.lineId && client) {
            await client.request(`
              mutation RemoveCartLine($cartId: ID!, $lineIds: [ID!]!) {
                cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                  cart { id checkoutUrl }
                }
              }
            `, { variables: { cartId, lineIds: [item.lineId] } });
          }
          set({ items: items.filter(i => i.product.id !== productId), isLoading: false });
        } catch (err) {
          console.error('Remove error:', err);
          set({ isLoading: false });
        }
      },

      updateQuantity: async (productId, quantity) => {
        const { items, cartId } = get();
        const item = items.find(i => i.product.id === productId);
        if (!item) return;

        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }

        set({ isLoading: true });
        try {
          if (cartId && item.lineId && client) {
            await client.request(`
              mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
                cartLinesUpdate(cartId: $cartId, lines: $lines) {
                  cart { id checkoutUrl }
                }
              }
            `, { variables: { cartId, lines: [{ id: item.lineId, quantity: Math.min(quantity, 5) }] } });
          }
          set({
            items: items.map(i =>
              i.product.id === productId ? { ...i, quantity: Math.min(quantity, 5) } : i
            ),
            isLoading: false,
          });
        } catch (err) {
          console.error('Update error:', err);
          set({ isLoading: false });
        }
      },

      toggleOpen: () => set({ isOpen: !get().isOpen }),
      setOpen: (open) => set({ isOpen: open }),

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      syncWithShopify: async () => {
        const { cartId } = get();
        if (!cartId || !client) return;

        try {
          const result = await client.request(`
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
                          product { title handle featuredImage { url } }
                          price { amount currencyCode }
                        }
                      }
                    }
                  }
                }
              }
            }
          `, { variables: { cartId } });

          const cart = result.data?.cart;
          if (cart) {
            set({ checkoutUrl: cart.checkoutUrl });
          }
        } catch (err) {
          console.error('Sync error:', err);
        }
      },
    }),
    {
      name: 'nonchalant-shopify-cart',
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    }
  )
);
