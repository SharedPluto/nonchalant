import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[35vh] md:min-h-[40vh] flex flex-col items-center justify-center bg-[var(--nc-cream)] overflow-hidden">
      {/* Logo Wordmark */}
      <div
        className={`transition-all duration-[800ms] ease-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
        }`}
      >
        <img
          src="/assets/logo-560.webp"
          srcSet="/assets/logo-320.webp 320w, /assets/logo-480.webp 480w, /assets/logo-560.webp 560w, /assets/logo-640.webp 640w"
          sizes="(min-width: 1024px) 460px, (min-width: 768px) 380px, 280px"
          alt="NonChalant"
          className="w-[280px] md:w-[380px] lg:w-[460px] h-auto"
          width="640"
          height="640"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-4 flex flex-col items-center gap-1 transition-all duration-[400ms] delay-[1000ms] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--nc-text-dimmed)]">
          Scroll to Explore
        </span>
        <ChevronDown size={14} className="text-[var(--nc-text-dimmed)] animate-bounce-scroll" />
      </div>
    </section>
  );
}
