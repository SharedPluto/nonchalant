import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useShopifyProducts } from '@/hooks/useShopifyProduct';

export default function NewDropsSection() {
  const { products, loading } = useShopifyProducts(50);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter to only "new" products
  const newProducts = products.filter((p) => p.isNew);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [newProducts]);

  // Auto-scroll effect
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || newProducts.length === 0) return;

    let animationId: number;
    let isPaused = false;
    const speed = 0.5; // pixels per frame (slow)

    const animate = () => {
      if (!el || isPaused) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      el.scrollLeft += speed;

      // Loop back when reaching end
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollLeft = 0;
      }

      animationId = requestAnimationFrame(animate);
    };

    // Start after 2 seconds
    const startTimer = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 2000);

    // Pause on hover / touch
    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };
    const handleTouchStart = () => { isPaused = true; };
    const handleTouchEnd = () => {
      setTimeout(() => { isPaused = false; }, 3000);
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(animationId);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [newProducts]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-[var(--nc-bg)]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="animate-pulse">
            <div className="h-8 bg-[var(--nc-offwhite)] w-48 mb-8" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[280px] md:w-[320px] flex-shrink-0">
                  <div className="aspect-[3/4] bg-[var(--nc-offwhite)] mb-3" />
                  <div className="h-4 bg-[var(--nc-offwhite)] w-3/4 mb-2" />
                  <div className="h-3 bg-[var(--nc-offwhite)] w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no new products, show a placeholder message
  if (newProducts.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-[var(--nc-bg)] border-b border-[var(--nc-border)]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={16} className="text-[var(--nc-purple)]" />
            <span className="text-eyebrow">Fresh Drops</span>
            <Sparkles size={16} className="text-[var(--nc-purple)]" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl uppercase tracking-[0.02em] mb-3">
            New Arrivals
          </h2>
          <p className="text-[14px] text-[var(--nc-grey)] max-w-[400px] mx-auto">
            New drops coming soon. Check back regularly for the latest.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-[var(--nc-bg)] border-b border-[var(--nc-border)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-[var(--nc-purple)]" />
              <span className="text-eyebrow">Fresh Drops</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl uppercase tracking-[0.02em]">
              What&apos;s New
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Scroll arrows — desktop only */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`w-9 h-9 border flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? 'border-[var(--nc-border)] hover:border-[var(--nc-purple)] text-[var(--nc-text)]'
                    : 'border-[var(--nc-border)]/30 text-[var(--nc-grey)]/30 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-9 h-9 border flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? 'border-[var(--nc-border)] hover:border-[var(--nc-purple)] text-[var(--nc-text)]'
                    : 'border-[var(--nc-border)]/30 text-[var(--nc-grey)]/30 cursor-not-allowed'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View All */}
            <Link
              to="/shop?tag=new"
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Product carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-6 md:-mx-12 px-6 md:px-12"
        >
          {newProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.handle}`}
              className="group flex-shrink-0 w-[220px] md:w-[280px] block"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] bg-[var(--nc-offwhite)] overflow-hidden mb-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* NEW badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-[var(--nc-purple)] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                    New
                  </span>
                </div>

                {/* Sale badge */}
                {product.originalPrice && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-[var(--nc-red)] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                      Sale
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--nc-grey)] mb-0.5">
                {product.brand}
              </p>
              <p className="text-[13px] font-medium text-[var(--nc-text)] leading-tight truncate mb-1">
                {product.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[var(--nc-text)]">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-[11px] text-[var(--nc-grey)] line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
