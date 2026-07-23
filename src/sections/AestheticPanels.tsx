import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { aesthetics } from '@/data/products';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function AestheticPanels() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const panels = panelsRef.current;
    if (!section || !container || !panels) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const totalWidth = panels.scrollWidth;
      const viewportWidth = container.offsetWidth;
      const scrollDistance = totalWidth - viewportWidth;

      const tween = gsap.to(panels, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollDistance * 1.5}`,
          scrub: 1,
          pin: container,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.kill();
        ScrollTrigger.getAll().forEach(st => {
          if (st.vars.trigger === section) st.kill();
        });
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  const handlePanelClick = (slug: string) => {
    navigate(`/shop?aesthetic=${slug}`);
  };

  return (
    <section ref={sectionRef} className="relative bg-[var(--nc-black)]">
      {/* Desktop: Scroll-driven horizontal */}
      <div ref={containerRef} className="hidden md:block h-screen overflow-hidden">
        <div
          ref={panelsRef}
          className="flex h-full"
          style={{ width: 'fit-content' }}
        >
          {aesthetics.map((aesthetic, index) => (
            <div
              key={aesthetic.slug}
              className="relative h-screen flex-shrink-0 overflow-hidden cursor-pointer group"
              style={{ width: '25vw' }}
              onClick={() => handlePanelClick(aesthetic.slug)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Border between panels */}
              {index > 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--nc-black)] z-10" />
              )}

              {/* Image */}
              <img
                src={aesthetic.image}
                alt={aesthetic.name}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                  hoveredIndex === index ? 'scale-[1.05]' : 'scale-100'
                }`}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Vertical subtitle on the left edge */}
              <div className="absolute left-4 top-0 bottom-0 flex items-center z-10">
                <span
                  className="text-white/90 text-[11px] font-medium uppercase tracking-[0.2em] whitespace-nowrap"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {aesthetic.subtitle}
                </span>
              </div>

              {/* Main title at top */}
              <div className="absolute top-0 left-0 right-0 p-8">
                <h3 className="text-white font-display text-3xl lg:text-4xl uppercase tracking-[0.02em] leading-tight">
                  {aesthetic.name}
                </h3>
              </div>

              {/* Hover overlay with Explore */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-[100px] glass-panel flex items-center justify-center transition-transform duration-300 ${
                  hoveredIndex === index ? 'translate-y-0' : 'translate-y-full'
                }`}
              >
                <span className="text-white text-[11px] uppercase tracking-[0.1em] flex items-center gap-2">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical stacked */}
      <div className="md:hidden">
        {aesthetics.map((aesthetic) => (
          <div
            key={aesthetic.slug}
            className="relative h-[80vh] overflow-hidden cursor-pointer"
            onClick={() => handlePanelClick(aesthetic.slug)}
          >
            <img
              src={aesthetic.image}
              alt={aesthetic.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Vertical subtitle on left */}
            <div className="absolute left-4 top-0 bottom-0 flex items-center z-10">
              <span
                className="text-white/90 text-[11px] font-medium uppercase tracking-[0.2em] whitespace-nowrap"
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)',
                }}
              >
                {aesthetic.subtitle}
              </span>
            </div>

            {/* Title at top */}
            <div className="absolute top-0 left-0 right-0 p-6">
              <h3 className="text-white font-display text-2xl uppercase tracking-[0.02em] leading-tight">
                {aesthetic.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
