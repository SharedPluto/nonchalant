import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import MetaTags from '@/components/seo/MetaTags';

export default function ShippingPage() {
  return (
    <>
      <MetaTags
        title="Shipping & Delivery"
        description="NonChalant delivers within Singapore only. Shipping is a $5 flat rate, and free on orders above $150."
        url="https://nonchalant.co/shipping"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 pb-24">
          <nav className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] mb-8">
            <Link to="/" className="hover:text-[var(--nc-purple)] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--nc-text)]">Shipping</span>
          </nav>

          <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] mb-4">
            Shipping & Delivery
          </h1>
          <p className="text-[var(--nc-grey)] mb-12">
            We deliver within Singapore only.
          </p>

          <section className="flex gap-4 md:gap-6 border-y border-[var(--nc-border)] py-8">
            <div className="flex-shrink-0 w-10 h-10 bg-[var(--nc-purple)]/10 flex items-center justify-center">
              <Truck size={20} className="text-[var(--nc-purple)]" />
            </div>
            <div>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-1">Singapore Delivery</h2>
              <p className="text-xs text-[var(--nc-purple)] uppercase tracking-wider mb-2">$5 flat rate</p>
              <p className="text-sm text-[var(--nc-grey)] leading-relaxed">
                Free shipping on orders above $150.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
