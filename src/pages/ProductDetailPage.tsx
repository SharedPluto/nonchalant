import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { products, getRelatedProducts } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { isShopifyConfigured } from '@/lib/shopify/client';
import { createCart } from '@/lib/shopify/queries';
import ProductCard from '@/components/ProductCard';
import MetaTags from '@/components/seo/MetaTags';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore(s => s.addItem);

  const product = products.find(p => p.id === id);
  const relatedProducts = product ? getRelatedProducts(product) : [];

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<string | null>(null);
  const [shopifyCheckoutUrl, setShopifyCheckoutUrl] = useState<string | null>(null);

  const sizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedSize('');
    setQuantity(1);
    setMainImage(0);
    setAdded(false);
    setSizeError(false);
    setShopifyCheckoutUrl(null);
  }, [id]);

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

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeError(true);
      sizeRef.current?.classList.add('animate-shake');
      setTimeout(() => sizeRef.current?.classList.remove('animate-shake'), 300);
      return;
    }

    setAdding(true);

    // Check if Shopify is configured
    if (isShopifyConfigured()) {
      // Use Shopify cart
      try {
        // For Shopify, we'd need the variant ID mapped to the size
        // This is a simplified flow - in production you'd map sizes to Shopify variant IDs
        const cart = await createCart([]);
        if (cart?.checkoutUrl) {
          setShopifyCheckoutUrl(cart.checkoutUrl);
        }
      } catch {
        // Fallback to local cart
        addItemToLocalCart();
      }
    } else {
      // Use local cart (static data mode)
      addItemToLocalCart();
    }
  };

  const addItemToLocalCart = () => {
    setTimeout(() => {
      if (product) {
        addItem(product, selectedSize);
      }
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }, 400);
  };

  const nextImage = () => setMainImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setMainImage((prev) => (prev - 1 + product.images.length) % product.images.length);

  const productUrl = `https://nonchalant.co/#/product/${product.id}`;
  const productImage = `${window.location.origin}${product.images[0]}`;

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
        availability={product.inStock ? 'InStock' : 'OutOfStock'}
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
              {/* Main Image */}
              <div
                className="relative aspect-[4/5] bg-[var(--nc-offwhite)] overflow-hidden cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={product.images[mainImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>

              {/* Thumbnails */}
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
              {/* Brand */}
              <button
                onClick={() => navigate(`/shop?brand=${product.brandSlug}`)}
                className="text-eyebrow hover:underline"
              >
                {product.brand}
              </button>

              {/* Name */}
              <h1 className="font-display text-2xl md:text-3xl uppercase tracking-[0.02em] mt-2">
                {product.name}
              </h1>

              {/* Price */}
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

              {/* Aesthetic Tags */}
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
              </div>

              {/* Short Description */}
              <p className="text-sm text-[var(--nc-text)]/70 mt-4 leading-relaxed">
                {product.description.split('.')[0]}.
              </p>

              {/* Divider */}
              <div className="h-px bg-[var(--nc-border)] my-6" />

              {/* Size Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)]">
                    Select Size
                  </span>
                  <span className="text-[11px] text-[var(--nc-purple)] cursor-pointer">
                    Size Guide
                  </span>
                </div>
                <div
                  ref={sizeRef}
                  className="flex flex-wrap gap-2"
                >
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`w-12 h-10 border text-sm transition-colors ${
                        selectedSize === size
                          ? 'bg-[var(--nc-purple)] border-[var(--nc-purple)] text-white'
                          : 'border-[var(--nc-border)] text-[var(--nc-text)] hover:border-[var(--nc-purple)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="text-[var(--nc-red)] text-xs mt-2">Please select a size</p>
                )}
              </div>

              {/* Quantity */}
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

              {/* Add to Cart / Checkout */}
              {shopifyCheckoutUrl ? (
                <a
                  href={shopifyCheckoutUrl}
                  className="block w-full mt-8 py-4 text-center text-xs uppercase tracking-[0.08em] font-medium bg-[var(--nc-purple)] text-white hover:bg-[var(--nc-purple-dark)] transition-colors"
                >
                  PROCEED TO CHECKOUT →
                </a>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`w-full mt-8 py-4 text-xs uppercase tracking-[0.08em] font-medium transition-all duration-300 ${
                    added
                      ? 'bg-[var(--nc-lime)] text-[var(--nc-black)]'
                      : 'bg-[var(--nc-purple)] text-white hover:bg-[var(--nc-purple-dark)]'
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
        {relatedProducts.length > 0 && (
          <section className="bg-[var(--nc-offwhite)] border-t border-[var(--nc-border)] py-12 md:py-16">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
              <h2 className="font-display text-2xl md:text-3xl uppercase tracking-[0.02em] mb-8">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
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
