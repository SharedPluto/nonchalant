export interface Product {
  id: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  aesthetic: string;
  aestheticSlug: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  sizes: string[];
  description: string;
  inStock: boolean;
  lowStock: boolean;
  isNew: boolean;
  sku: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Brand {
  name: string;
  slug: string;
  logoText: string;
  previewImage: string;
}

export interface Category {
  name: string;
  slug: string;
  image: string;
}

export interface Aesthetic {
  name: string;
  slug: string;
  image: string;
  subtitle: string;
}

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'best-selling';

export type ThemeMode = 'light' | 'dark';
