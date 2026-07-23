import { useNavigate } from 'react-router-dom';
import { brands } from '@/data/products';
import { useInView } from '@/hooks/useInView';
import { ArrowRight } from 'lucide-react';

export default function BrandShowcase() {
  const navigate = useNavigate();
  const { ref: sectionRef, isInView } = useInView();

  return (
    <section ref={sectionRef} className="bg-[var(--nc-cream)] py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] text-[var(--nc-text)]">
            Shop by Brand
          </h2>
        </div>

        {/* Brand List */}
        <div className="flex flex-col">
          {brands.map((brand, index) => (
            <button
              key={brand.slug}
              onClick={() => navigate(`/shop?brand=${brand.slug}`)}
              className={`group w-full flex items-center justify-between py-5 md:py-6 px-4 md:px-6 border-t border-[var(--nc-border)] bg-transparent cursor-pointer transition-all duration-400 hover:bg-[var(--nc-card-bg)] hover:pl-6 md:hover:pl-8 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              } ${index === brands.length - 1 ? 'border-b' : ''}`}
              style={{
                transitionDelay: `${index * 0.04}s`,
                transitionDuration: '0.5s',
              }}
            >
              <span className="font-display text-xl md:text-2xl lg:text-3xl uppercase tracking-[0.05em] text-[var(--nc-text)] group-hover:text-[var(--nc-purple)] transition-colors duration-300">
                {brand.logoText}
              </span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-[var(--nc-grey)] group-hover:text-[var(--nc-purple)] group-hover:translate-x-1 transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
