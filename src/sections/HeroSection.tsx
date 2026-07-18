import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center bg-[var(--nc-cream)] overflow-hidden">
      {/* Logo Wordmark */}
      <div
        className={`transition-all duration-[800ms] ease-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
        }`}
      >
        <svg
          viewBox="0 0 900 120"
          className="w-[85vw] max-w-[900px] h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="0"
            y="95"
            fontFamily="Geist, system-ui, -apple-system, sans-serif"
            fontWeight="400"
            fontSize="110"
            letterSpacing="-2"
          >
            <tspan fill="#8A8A8A">Non</tspan>
            <tspan fill="#6200EA">Chalant</tspan>
          </text>
        </svg>
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
