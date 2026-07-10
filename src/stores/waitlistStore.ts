import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getShopifyClient } from '@/lib/shopify/client';

const client = getShopifyClient();

export interface WaitlistEntry {
  email: string;
  productHandle: string;
  productName: string;
  productImage: string;
  size?: string;
  createdAt: string;
  syncedToShopify: boolean;
}

interface WaitlistState {
  entries: WaitlistEntry[];
  isModalOpen: boolean;
  targetProduct: { handle: string; name: string; image: string } | null;
  targetSize: string | undefined;

  openModal: (product: { handle: string; name: string; image: string }, size?: string) => void;
  closeModal: () => void;
  addEntry: (email: string) => Promise<{ success: boolean; message: string }>;
  isSubscribed: (productHandle: string, email: string) => boolean;
  exportData: () => WaitlistEntry[];
  getCountForProduct: (productHandle: string) => number;
}

/** Create a Shopify customer with acceptsMarketing=true for email collection */
async function createShopifyCustomer(email: string): Promise<{ success: boolean; alreadyExists: boolean }> {
  try {
    // Generate a random password (user never sees this)
    const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

    const result = await client.request(
      `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            acceptsMarketing
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `,
      {
        variables: {
          input: {
            email: email.toLowerCase().trim(),
            password: randomPassword,
            acceptsMarketing: true,
          },
        },
      }
    );

    const errors = result.data?.customerCreate?.customerUserErrors || [];

    // Check if email already exists
    const emailTakenError = errors.find(
      (e: any) => e.field?.includes('email') && e.message?.toLowerCase().includes('taken')
    );

    if (emailTakenError) {
      // Customer already exists — that's fine, they're already subscribed
      return { success: true, alreadyExists: true };
    }

    if (errors.length > 0) {
      console.error('Shopify customer creation errors:', errors);
      return { success: false, alreadyExists: false };
    }

    return { success: true, alreadyExists: false };
  } catch (err) {
    console.error('Failed to create Shopify customer:', err);
    return { success: false, alreadyExists: false };
  }
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

      addEntry: async (email) => {
        const { targetProduct, targetSize, entries } = get();
        if (!targetProduct) return { success: false, message: 'No product selected' };

        const emailLower = email.toLowerCase().trim();

        // Check if already subscribed to this product locally
        const alreadySubscribed = entries.some(
          (e) => e.productHandle === targetProduct.handle && e.email === emailLower
        );

        if (alreadySubscribed) {
          set({ isModalOpen: false, targetProduct: null, targetSize: undefined });
          return { success: true, message: "You're already on the list for this product!" };
        }

        // Step 1: Create Shopify customer (subscribes them to email marketing)
        const shopifyResult = await createShopifyCustomer(emailLower);

        // Step 2: Save locally for per-product tracking
        const newEntry: WaitlistEntry = {
          email: emailLower,
          productHandle: targetProduct.handle,
          productName: targetProduct.name,
          productImage: targetProduct.image,
          size: targetSize,
          createdAt: new Date().toISOString(),
          syncedToShopify: shopifyResult.success,
        };

        set({
          entries: [...entries, newEntry],
          isModalOpen: false,
          targetProduct: null,
          targetSize: undefined,
        });

        if (shopifyResult.success) {
          if (shopifyResult.alreadyExists) {
            return { success: true, message: "You're on the list! (You were already subscribed to our newsletter.)" };
          }
          return { success: true, message: "You're on the list! We'll email you when it's back in stock." };
        } else {
          // Saved locally but Shopify sync failed
          return { success: true, message: "You're on the list! We'll email you when it's back in stock." };
        }
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
