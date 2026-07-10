import { useNavigate } from 'react-router-dom';
import { categories } from '@/data/products';
import { useInView } from '@/hooks/useInView';

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
          <p className="text-eyebrow mb-3">Browse by Category</p>
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] text-[var(--nc-text)]">
            What Are You Looking For?
          </h2>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <div
              key={category.slug}
              onClick={() => navigate(`/shop?category=${category.slug}`)}
              className={`group cursor-pointer bg-[var(--nc-offwhite)] aspect-square flex flex-col items-center justify-center overflow-hidden transition-all duration-500 hover:bg-[#E8E8E8] ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{
                transitionDelay: `${index * 0.08}s`,
                transitionDuration: '0.6s',
              }}
            >
              {/* Category Image */}
              <div className="w-[55%] h-[55%] flex items-center justify-center overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Category Name */}
              <h3 className="mt-4 text-base md:text-lg font-medium text-[var(--nc-text)]">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
