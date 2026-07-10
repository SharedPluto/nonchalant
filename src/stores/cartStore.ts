import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, size) => {
        const existing = get().items.find(
          item => item.product.id === product.id && item.size === size
        );
        if (existing) {
          set({
            items: get().items.map(item =>
              item.product.id === product.id && item.size === size
                ? { ...item, quantity: Math.min(item.quantity + 1, 5) }
                : item
            ),
          });
        } else {
          set({ items: [...get().items, { product, size, quantity: 1 }] });
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter(item => item.product.id !== itemId) });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          set({ items: get().items.filter(item => item.product.id !== itemId) });
        } else {
          set({
            items: get().items.map(item =>
              item.product.id === itemId ? { ...item, quantity: Math.min(quantity, 5) } : item
            ),
          });
        }
      },
      toggleOpen: () => set({ isOpen: !get().isOpen }),
      setOpen: (open) => set({ isOpen: open }),
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    {
      name: 'nonchalant-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
