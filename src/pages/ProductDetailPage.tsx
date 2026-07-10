import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Bell } from 'lucide-react';
import { useShopifyCartStore } from '@/stores/shopifyCartStore';
import { useWaitlistStore } from '@/stores/waitlistStore';
import { getVariantIdForProductSize, useShopifyRelatedProducts } from '@/hooks/useShopifyProduct';
import { products as staticProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import MetaTags from '@/components/seo/MetaTags';
import { getShopifyClient } from '@/lib/shopify/client';
import { mapShopifyProductToProduct } from '@/lib/shopify/mapper';
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

/** Check if a specific size variant is in stock */
function isVariantAvailable(shopifyVariants: any[], size: string): boolean {
  const variant = shopifyVariants.find((v: any) => {
    const sizeOpt = v.node.selectedOptions.find((o: any) => o.name.toLowerCase() === 'size');
    return sizeOpt?.value === size;
  });
  return variant?.node?.availableForSale ?? false;
}

/** Get variant ID for a specific size */
function getVariantId(shopifyVariants: any[], size: string): string | null {
  const variant = shopifyVariants.find((v: any) => {
    const sizeOpt = v.node.selectedOptions.find((o: any) => o.name.toLowerCase() === 'size');
    return sizeOpt?.value === size;
  });
  return variant?.node?.id || null;
}

export default function ProductDetailPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addItem, lastAdded } = useShopifyCartStore();
  const { openModal } = useWaitlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [shopifyVariants, setShopifyVariants] = useState<any[]>([]);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSizeInStock, setSelectedSizeInStock] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<string | null>(null);

  // Fetch related products from Shopify
  const { products: shopifyRelatedProducts, loading: relatedLoading } = useShopifyRelatedProducts(
    product?.handle,
    product?.brand || '',
    product?.aestheticSlug || '',
    50
  );

  const sizeRef = useRef<HTMLDivElement>(null);

  // Fetch from Shopify
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedSize('');
    setSelectedSizeInStock(true);
    setQuantity(1);
    setMainImage(0);
    setAdded(false);
    setSizeError(false);
    setLoading(true);

    async function fetchProduct() {
      if (!handle) return;

      const staticProd = staticProducts.find(p => p.handle === handle);

      try {
        const result = await client.request(PRODUCT_QUERY, { variables: { handle } });
        const shopifyProduct = result.data?.product;

        if (shopifyProduct) {
          const mapped = mapShopifyProductToProduct(shopifyProduct);
          setProduct(mapped);
          // Store raw variants for per-variant stock checking
          setShopifyVariants(shopifyProduct.variants.edges || []);
          // Set default variant
          const firstVariant = shopifyProduct.variants.edges[0]?.node;
          if (firstVariant) {
            setVariantId(firstVariant.id);
          }
        } else if (staticProd) {
          setProduct(staticProd);
          setShopifyVariants([]);
        }
      } catch {
        if (staticProd) {
          setProduct(staticProd);
          setShopifyVariants([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [handle]);

  // Handle size selection — check stock for this specific variant
  const handleSizeSelect = useCallback((size: string) => {
    setSelectedSize(size);
    setSizeError(false);

    if (shopifyVariants.length > 0) {
      // Check if this specific size variant is available
      const inStock = isVariantAvailable(shopifyVariants, size);
      setSelectedSizeInStock(inStock);

      // Get the variant ID
      const vid = getVariantId(shopifyVariants, size);
      if (vid) setVariantId(vid);
    } else {
      // Fallback: if no Shopify variants, assume in stock
      setSelectedSizeInStock(true);
    }
  }, [shopifyVariants]);

  const handleAddToCart = async () => {
    if (!product || !selectedSize) {
      setSizeError(true);
      sizeRef.current?.classList.add('animate-shake');
      setTimeout(() => sizeRef.current?.classList.remove('animate-shake'), 300);
      return;
    }

    // Double-check stock before adding
    if (!selectedSizeInStock) {
      // Show notify me instead
      openModal(
        { handle: product.handle, name: product.name, image: product.images[0] },
        selectedSize
      );
      return;
    }

    if (!variantId) {
      const vid = shopifyVariants.length > 0
        ? getVariantId(shopifyVariants, selectedSize)
        : await getVariantIdForProductSize(product.handle, selectedSize);
      if (vid) {
        setVariantId(vid);
        doAddToCart(vid);
      } else {
        setSizeError(true);
      }
      return;
    }

    doAddToCart(variantId);
  };

  const doAddToCart = async (vid: string) => {
    if (!product || !selectedSize) return;
    setAdding(true);
    await addItem(product, selectedSize, vid);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Notify me handler
  const handleNotifyMe = () => {
    if (!product) return;
    openModal(
      { handle: product.handle, name: product.name, image: product.images[0] },
      selectedSize || undefined
    );
  };

  const nextImage = () => product && setMainImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () => product && setMainImage((prev) => (prev - 1 + product.images.length) % product.images.length);

  // Sync added state from store
  useEffect(() => {
    if (lastAdded && lastAdded === product?.id) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  }, [lastAdded, product?.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px] flex items-center justify-center">
        <div className="animate-pulse text-[var(--nc-grey)]">Loading...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px] flex items-center justify-center">
        <MetaTags title="Product Not Found" description="The product you are looking for does not exist." />
        <div className="text-center">
          <p className="text-[var(--nc-grey)] mb-4">Product not found.</p>
          <Link to="/shop" className="btn-primary text-xs py-3 px-6">Back to Shop</Link>
        </div>
      </main>
    );
  }

  const productUrl = `https://nonchalant.co/#/product/${product.handle}`;
  const productImage = product.images[0] || '';

  // Overall product stock status (any variant available)
  const anyInStock = shopifyVariants.length > 0
    ? shopifyVariants.some((v: any) => v.node.availableForSale)
    : product.inStock;

  return (
    <>
      <MetaTags
        title={product.name}
        description={product.description}
        url={productUrl}
        image={productImage}
        type="product"
        price={product.price}
        brand={product.brand}
        availability={anyInStock ? 'InStock' : 'OutOfStock'}
        sku={product.sku}
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[80px]">
        {/* Breadcrumb */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-6">
          <nav className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)]">
            <Link to="/" className="hover:text-[var(--nc-purple)] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-[var(--nc-purple)] transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-[var(--nc-purple)] transition-colors">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--nc-text)]">{product.name}</span>
          </nav>
        </div>

        {/* Product Hero */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Image Gallery */}
            <div>
              <div
                className="relative aspect-[4/5] bg-[var(--nc-offwhite)] overflow-hidden cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={product.images[mainImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {/* Sold out overlay */}
                {!anyInStock && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <span className="bg-[var(--nc-text)] text-white text-[10px] uppercase tracking-wider px-3 py-1.5 font-medium">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(idx)}
                      className={`w-20 h-24 flex-shrink-0 overflow-hidden border-2 transition-colors ${
                        idx === mainImage ? 'border-[var(--nc-purple)]' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:pt-4">
              <button
                onClick={() => navigate(`/shop?brand=${product.brandSlug}`)}
                className="text-eyebrow hover:underline"
              >
                {product.brand}
              </button>

              <h1 className="font-display text-2xl md:text-3xl uppercase tracking-[0.02em] mt-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-4">
                <span className="text-xl md:text-2xl font-medium">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-[var(--nc-grey)] line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="text-sm text-[var(--nc-red)]">
                      Save ${product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => navigate(`/shop?aesthetic=${product.aestheticSlug}`)}
                  className="bg-[var(--nc-offwhite)] px-3 py-1.5 text-[11px] uppercase tracking-wider hover:bg-[var(--nc-purple)] hover:text-white transition-colors"
                >
                  {product.aesthetic}
                </button>
                {product.isNew && (
                  <span className="bg-[var(--nc-purple)] text-white px-3 py-1.5 text-[11px] uppercase tracking-wider">
                    New
                  </span>
                )}
                {product.originalPrice && (
                  <span className="bg-[var(--nc-red)] text-white px-3 py-1.5 text-[11px] uppercase tracking-wider">
                    Sale
                  </span>
                )}
                {!anyInStock && (
                  <span className="bg-[var(--nc-text)] text-white px-3 py-1.5 text-[11px] uppercase tracking-wider">
                    Sold Out
                  </span>
                )}
              </div>

              <p className="text-sm text-[var(--nc-text)]/70 mt-4 leading-relaxed">
                {product.description.split('.')[0]}.
              </p>

              <div className="h-px bg-[var(--nc-border)] my-6" />

              {/* Size Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)]">
                    Select Size
                  </span>
                  <Link
                    to="/size-guide"
                    className="text-[11px] uppercase tracking-wider text-[var(--nc-purple)] hover:underline"
                  >
                    Size Guide
                  </Link>
                </div>
                <div ref={sizeRef} className="flex flex-wrap gap-2">
                  {product.sizes.map(size => {
                    // Check per-variant stock
                    const sizeInStock = shopifyVariants.length > 0
                      ? isVariantAvailable(shopifyVariants, size)
                      : product.inStock;

                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`relative w-12 h-10 border text-sm transition-all ${
                          selectedSize === size
                            ? sizeInStock
                              ? 'bg-[var(--nc-purple)] border-[var(--nc-purple)] text-white'
                              : 'bg-[var(--nc-text)] border-[var(--nc-text)] text-[var(--nc-bg)]'
                            : sizeInStock
                              ? 'border-[var(--nc-border)] text-[var(--nc-text)] hover:border-[var(--nc-purple)]'
                              : 'border-[var(--nc-border)] text-[var(--nc-grey)] hover:border-[var(--nc-text)]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && (
                  <p className="text-[var(--nc-red)] text-xs mt-2">Please select a size</p>
                )}
                {selectedSize && !selectedSizeInStock && (
                  <p className="text-[var(--nc-grey)] text-xs mt-2">
                    Size {selectedSize} is out of stock. Click "Notify Me" to get alerted when it's back.
                  </p>
                )}
              </div>

              {/* Quantity — only show if in-stock size selected */}
              {selectedSize && selectedSizeInStock && (
                <div className="mt-6">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] block mb-3">
                    Quantity
                  </span>
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-[var(--nc-border)] flex items-center justify-center hover:border-[var(--nc-purple)] transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <div className="w-12 h-10 border-t border-b border-[var(--nc-border)] flex items-center justify-center text-sm">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(Math.min(5, quantity + 1))}
                      className="w-10 h-10 border border-[var(--nc-border)] flex items-center justify-center hover:border-[var(--nc-purple)] transition-colors disabled:opacity-50"
                      disabled={quantity >= 5}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* CTA Button: Add to Bag OR Notify Me */}
              <div className="mt-8">
                {!anyInStock ? (
                  /* Entire product sold out */
                  <button
                    onClick={handleNotifyMe}
                    className="w-full py-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.08em] font-medium bg-[var(--nc-text)] text-[var(--nc-bg)] hover:bg-[var(--nc-purple)] hover:text-white transition-all"
                  >
                    <Bell size={15} />
                    Notify Me When Available
                  </button>
                ) : selectedSize && !selectedSizeInStock ? (
                  /* Selected size sold out */
                  <button
                    onClick={handleNotifyMe}
                    className="w-full py-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.08em] font-medium bg-[var(--nc-text)] text-[var(--nc-bg)] hover:bg-[var(--nc-purple)] hover:text-white transition-all"
                  >
                    <Bell size={15} />
                    Notify Me — Size {selectedSize}
                  </button>
                ) : (
                  /* In stock — Add to Bag */
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || !selectedSize}
                    className={`w-full py-4 text-xs uppercase tracking-[0.08em] font-medium transition-all duration-300 ${
                      added
                        ? 'bg-[var(--nc-lime)] text-[var(--nc-black)]'
                        : 'bg-[var(--nc-purple)] text-white hover:bg-[var(--nc-purple-dark)] disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {adding ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : added ? (
                      'ADDED ✓'
                    ) : (
                      'ADD TO BAG'
                    )}
                  </button>
                )}
              </div>

              {/* Accordions */}
              <div className="mt-8 space-y-0">
                {[
                  { id: 'desc', title: 'Description', content: product.description },
                  { id: 'shipping', title: 'Shipping & Returns', content: 'Free shipping on orders over $150. Standard delivery 3-5 business days. Returns accepted within 30 days of delivery. Items must be unworn with original tags attached.' },
                  { id: 'details', title: 'Details', content: `SKU: ${product.sku}\nMaterial: Premium quality materials\nCare: Follow label instructions\nCountry of origin: Imported` },
                ].map((section) => (
                  <div key={section.id} className="border-t border-[var(--nc-border)]">
                    <button
                      onClick={() => setAccordionOpen(accordionOpen === section.id ? null : section.id)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="text-sm font-medium">{section.title}</span>
                      <span className={`text-[var(--nc-grey)] transition-transform duration-200 ${accordionOpen === section.id ? 'rotate-180' : ''}`}>
                        <ChevronLeft size={14} className="-rotate-90" />
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        accordionOpen === section.id ? 'max-h-60 pb-4' : 'max-h-0'
                      }`}
                    >
                      <p className="text-sm text-[var(--nc-grey)] leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {(shopifyRelatedProducts.length > 0 || relatedLoading) && (
          <section className="bg-[var(--nc-offwhite)] border-t border-[var(--nc-border)] py-12 md:py-16">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
              <h2 className="font-display text-2xl md:text-3xl uppercase tracking-[0.02em] mb-8">
                You Might Also Like
              </h2>
              {relatedLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse text-[var(--nc-grey)]">Loading related products...</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {shopifyRelatedProducts.map((p, index) => (
                    <ProductCard key={p.id} product={p} index={index} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Lightbox */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-6 right-6 text-white hover:text-[var(--nc-lime)] transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={24} />
            </button>
            <button
              className="absolute left-6 text-white hover:text-[var(--nc-lime)] transition-colors"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="absolute right-6 text-white hover:text-[var(--nc-lime)] transition-colors"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight size={32} />
            </button>
            <img
              src={product.images[mainImage]}
              alt={product.name}
              className="max-w-[90%] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </main>
    </>
  );
}
