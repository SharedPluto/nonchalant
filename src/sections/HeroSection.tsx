import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[50vh] md:min-h-[55vh] flex flex-col items-center justify-center bg-[var(--nc-cream)] overflow-hidden">
      {/* Logo Wordmark */}
      <div
        className={`transition-all duration-[800ms] ease-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
        }`}
      >
        <img
          src="/assets/logo.png"
          alt="NonChalant"
          className="w-[340px] md:w-[460px] lg:w-[580px] h-auto"
        />
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-10 flex flex-col items-center gap-2 transition-all duration-[400ms] delay-[1000ms] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--nc-text-dimmed)]">
          Scroll to Explore
        </span>
        <ChevronDown size={16} className="text-[var(--nc-text-dimmed)] animate-bounce-scroll" />
      </div>
    </section>
  );
}
