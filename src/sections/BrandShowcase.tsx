import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { brands } from '@/data/products';
import { useInView } from '@/hooks/useInView';

export default function BrandShowcase() {
  const { ref: sectionRef, isInView } = useInView();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | undefined>(undefined);

  const [hoveredBrand, setHoveredBrand] = useState<typeof brands[0] | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1100);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const animate = useCallback(() => {
    const lerp = 0.15;
    currentPos.current.x += (mousePos.current.x - currentPos.current.x) * lerp;
    currentPos.current.y += (mousePos.current.y - currentPos.current.y) * lerp;

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${currentPos.current.x + 20}px, ${currentPos.current.y + 20}px)`;
    }
    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      rafId.current = requestAnimationFrame(animate);
    }

    return () => {
      if (container) container.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isDesktop, animate]);

  return (
    <section ref={sectionRef} className="bg-[var(--nc-cream)] py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <p className="text-eyebrow mb-3">The Brands We Carry</p>
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] text-[var(--nc-text)]">
            By Brand
          </h2>
        </div>

        {/* Brand Grid */}
        <div ref={containerRef} className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {brands.map((brand, index) => (
              <div
                key={brand.slug}
                onClick={() => navigate(`/shop?brand=${brand.slug}`)}
                onMouseEnter={() => setHoveredBrand(brand)}
                onMouseLeave={() => setHoveredBrand(null)}
                className={`relative aspect-[3/2] bg-[var(--nc-card-bg)] border border-[var(--nc-border)] flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-400 hover:border-[var(--nc-purple)] ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
                style={{
                  transitionDelay: `${index * 0.06}s`,
                  transitionDuration: '0.6s',
                }}
              >
                <span
                  className={`font-display text-lg md:text-xl font-medium uppercase tracking-[0.05em] transition-all duration-400 select-none ${
                    hoveredBrand?.slug === brand.slug
                      ? 'text-[var(--nc-text)]'
                      : 'text-[var(--nc-grey)]'
                  }`}
                >
                  {brand.logoText}
                </span>
              </div>
            ))}
          </div>

          {/* Cursor-following preview */}
          {isDesktop && (
            <div
              ref={cursorRef}
              className={`absolute top-0 left-0 pointer-events-none z-50 transition-opacity duration-200 ${
                hoveredBrand ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ willChange: 'transform' }}
            >
              {hoveredBrand && (
                <div className="w-[280px] h-[180px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                  <img
                    src={hoveredBrand.previewImage}
                    alt={hoveredBrand.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
