import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Check, Bell } from 'lucide-react';
import { useShopifyCartStore } from '@/stores/shopifyCartStore';
import { useWaitlistStore } from '@/stores/waitlistStore';
import { getShopifyClient } from '@/lib/shopify/client';
import { mapShopifyProductToProduct, getVariantIdForSize } from '@/lib/shopify/mapper';
import type { Product } from '@/types';

interface QuickViewModalProps {
  productHandle: string | null;
  onClose: () => void;
}

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

export default function QuickViewModal({ productHandle, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [shopifyProduct, setShopifyProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useShopifyCartStore();
  const { openModal } = useWaitlistStore();

  // Fetch product data when handle changes
  useEffect(() => {
    if (!productHandle) {
      setProduct(null);
      setShopifyProduct(null);
      setSelectedSize(null);
      setSelectedImage(0);
      return;
    }

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const result = await client.request(PRODUCT_QUERY, { variables: { handle: productHandle } });
        const sp = result.data?.product;
        if (!sp) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        const mapped = mapShopifyProductToProduct(sp);
        setProduct(mapped);
        setShopifyProduct(sp);
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [productHandle]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || !selectedSize || !shopifyProduct) return;

    // Block if selected size is out of stock
    if (!isSizeInStock(selectedSize)) {
      handleNotifyMe();
      return;
    }

    const variantId = getVariantIdForSize(shopifyProduct, selectedSize);
    if (!variantId) return;

    setAdding(true);
    try {
      await addItem(product, selectedSize, variantId);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAdding(false);
    }
  };

  // Handle notify me for out of stock
  const handleNotifyMe = () => {
    if (!product) return;
    openModal(
      {
        handle: product.handle,
        name: product.name,
        image: product.images[0],
      },
      selectedSize || undefined
    );
    onClose();
  };

  // Check if selected size is in stock
  const isSizeInStock = (size: string) => {
    if (!shopifyProduct) return true;
    const variant = shopifyProduct.variants.edges.find((v: any) => {
      const opt = v.node.selectedOptions.find((o: any) => o.name.toLowerCase() === 'size');
      return opt?.value === size;
    });
    return variant?.node.availableForSale ?? false;
  };

  // Selected size stock status (derived from isSizeInStock)
  const selectedSizeInStock = selectedSize ? isSizeInStock(selectedSize) : true;

  // Get available sizes
  const availableSizes = product?.sizes || [];

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (productHandle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [productHandle]);

  if (!productHandle) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-[var(--nc-bg)] w-full max-w-[900px] max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-[var(--nc-bg)] border border-[var(--nc-border)] text-[var(--nc-text)] hover:text-[var(--nc-purple)] hover:border-[var(--nc-purple)] transition-colors"
        >
          <X size={16} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse text-[var(--nc-grey)] text-sm">Loading...</div>
          </div>
        ) : error || !product ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[var(--nc-grey)]">{error || 'Product not found'}</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Image section */}
            <div className="w-full md:w-1/2 bg-[var(--nc-offwhite)]">
              {/* Main image */}
              <div className="relative aspect-[3/4] md:aspect-auto md:h-full">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Image thumbnails (if multiple) */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center">
                    {product.images.slice(0, 4).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-12 h-12 border-2 overflow-hidden transition-colors ${
                          selectedImage === i
                            ? 'border-[var(--nc-purple)]'
                            : 'border-white/80 hover:border-white'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                  {product.originalPrice && (
                    <span className="bg-[var(--nc-red)] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                      Sale
                    </span>
                  )}
                  {product.isNew && !product.originalPrice && (
                    <span className="bg-[var(--nc-purple)] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                      New
                    </span>
                  )}
                  {!product.inStock && (
                    <span className="bg-[var(--nc-text)] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details section */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
              {/* Brand */}
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--nc-purple)] mb-1">
                {product.brand}
              </p>

              {/* Name */}
              <h2 className="text-lg md:text-xl font-medium text-[var(--nc-text)] leading-tight mb-3">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-lg text-[var(--nc-text)]">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[var(--nc-grey)] line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[13px] text-[var(--nc-grey)] leading-relaxed mb-6 line-clamp-4">
                {product.description}
              </p>

              {/* Size selector */}
              {availableSizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)]">
                      Select Size
                    </span>
                    <Link
                      to="/size-guide"
                      onClick={onClose}
                      className="text-[10px] uppercase tracking-wider text-[var(--nc-purple)] hover:underline"
                    >
                      Size Guide
                    </Link>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {availableSizes.map((size) => {
                      const inStock = isSizeInStock(size);
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`py-2.5 text-[11px] border transition-all ${
                            selectedSize === size
                              ? inStock
                                ? 'border-[var(--nc-purple)] bg-[var(--nc-purple)] text-white'
                                : 'border-[var(--nc-text)] bg-[var(--nc-text)] text-[var(--nc-bg)]'
                              : inStock
                                ? 'border-[var(--nc-border)] hover:border-[var(--nc-purple)] text-[var(--nc-text)]'
                                : 'border-[var(--nc-border)] text-[var(--nc-grey)] hover:border-[var(--nc-text)]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto space-y-3">
                {selectedSize && !selectedSizeInStock ? (
                  /* Selected size out of stock - Notify me */
                  <button
                    onClick={handleNotifyMe}
                    className="w-full py-3.5 flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider font-medium bg-[var(--nc-text)] text-[var(--nc-bg)] hover:bg-[var(--nc-purple)] hover:text-white transition-all"
                  >
                    <Bell size={15} />
                    Notify Me — Size {selectedSize}
                  </button>
                ) : (
                  /* In stock - Add to cart */
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize || adding}
                    className={`w-full py-3.5 flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider font-medium transition-all ${
                      added
                        ? 'bg-green-600 text-white'
                        : 'bg-[var(--nc-purple)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={16} />
                        Added to Bag
                      </>
                    ) : adding ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag size={15} />
                        Add to Bag
                      </>
                    )}
                  </button>
                )}

                {/* View full details link */}
                <Link
                  to={`/product/${product.handle}`}
                  onClick={onClose}
                  className="block w-full py-3 text-center text-[11px] uppercase tracking-wider text-[var(--nc-grey)] hover:text-[var(--nc-purple)] transition-colors border border-[var(--nc-border)] hover:border-[var(--nc-purple)]"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
