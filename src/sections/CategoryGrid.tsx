import { useNavigate } from 'react-router-dom';
import { categories } from '@/data/products';
import { useInView } from '@/hooks/useInView';
import { ArrowRight } from 'lucide-react';

export default function CategoryGrid() {
  const navigate = useNavigate();
  const { ref: sectionRef, isInView } = useInView();

  return (
    <section ref={sectionRef} className="bg-[var(--nc-cream)] py-16 md:py-24 border-t border-[var(--nc-border)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] text-[var(--nc-text)]">
            Shop by Category
          </h2>
        </div>

        {/* Category List */}
        <div className="flex flex-col">
          {categories.map((category, index) => (
            <button
              key={category.slug}
              onClick={() => navigate(`/shop?category=${category.slug}`)}
              className={`group w-full flex items-center justify-between py-5 md:py-6 px-4 md:px-6 border-t border-[var(--nc-border)] bg-transparent cursor-pointer transition-all duration-400 hover:bg-[var(--nc-card-bg)] hover:pl-6 md:hover:pl-8 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              } ${index === categories.length - 1 ? 'border-b' : ''}`}
              style={{
                transitionDelay: `${index * 0.05}s`,
                transitionDuration: '0.5s',
              }}
            >
              <span className="font-display text-xl md:text-2xl lg:text-3xl uppercase tracking-[0.05em] text-[var(--nc-text)] group-hover:text-[var(--nc-purple)] transition-colors duration-300">
                {category.name}
              </span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-[var(--nc-grey)] group-hover:text-[var(--nc-purple)] group-hover:translate-x-1 transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
