import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WaitlistEntry {
  email: string;
  productHandle: string;
  productName: string;
  productImage: string;
  size?: string;
  createdAt: string;
}

interface WaitlistState {
  entries: WaitlistEntry[];
  isModalOpen: boolean;
  targetProduct: { handle: string; name: string; image: string } | null;
  targetSize: string | undefined;

  openModal: (product: { handle: string; name: string; image: string }, size?: string) => void;
  closeModal: () => void;
  addEntry: (email: string) => void;
  isSubscribed: (productHandle: string, email: string) => boolean;
  exportData: () => WaitlistEntry[];
  getCountForProduct: (productHandle: string) => number;
}

export const useWaitlistStore = create<WaitlistState>()(
  persist(
    (set, get) => ({
      entries: [],
      isModalOpen: false,
      targetProduct: null,
      targetSize: undefined,

      openModal: (product, size) =>
        set({
          isModalOpen: true,
          targetProduct: product,
          targetSize: size,
        }),

      closeModal: () =>
        set({
          isModalOpen: false,
          targetProduct: null,
          targetSize: undefined,
        }),

      addEntry: (email) => {
        const { targetProduct, targetSize, entries } = get();
        if (!targetProduct) return;

        const emailLower = email.toLowerCase().trim();

        // Check if already subscribed to this product
        const alreadySubscribed = entries.some(
          (e) => e.productHandle === targetProduct.handle && e.email === emailLower
        );

        if (alreadySubscribed) {
          // Just close modal, they're already on the list
          set({ isModalOpen: false, targetProduct: null, targetSize: undefined });
          return;
        }

        const newEntry: WaitlistEntry = {
          email: emailLower,
          productHandle: targetProduct.handle,
          productName: targetProduct.name,
          productImage: targetProduct.image,
          size: targetSize,
          createdAt: new Date().toISOString(),
        };

        set({
          entries: [...entries, newEntry],
          isModalOpen: false,
          targetProduct: null,
          targetSize: undefined,
        });
      },

      isSubscribed: (productHandle, email) => {
        return get().entries.some(
          (e) => e.productHandle === productHandle && e.email === email.toLowerCase().trim()
        );
      },

      exportData: () => get().entries,

      getCountForProduct: (productHandle) => {
        return get().entries.filter((e) => e.productHandle === productHandle).length;
      },
    }),
    {
      name: 'nonchalant-waitlist',
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
