import { Link } from 'react-router-dom';
import { Truck, Clock, Globe, Shield } from 'lucide-react';
import MetaTags from '@/components/seo/MetaTags';

export default function ShippingPage() {
  return (
    <>
      <MetaTags
        title="Shipping & Delivery"
        description="Shipping information for NonChalant. Free shipping on orders over $150. Standard delivery 3-5 business days."
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
            We ship worldwide. All orders are processed within 1-2 business days.
          </p>

          {/* Shipping Options */}
          <section className="mb-16 space-y-8">
            {[
              {
                icon: Truck,
                title: 'Standard Shipping',
                desc: 'Free on orders over $150',
                detail: '3-5 business days. $8 flat rate for orders under $150.',
              },
              {
                icon: Clock,
                title: 'Express Shipping',
                desc: 'Get it faster',
                detail: '1-2 business days. $18 flat rate. Free on orders over $500.',
              },
              {
                icon: Globe,
                title: 'International Shipping',
                desc: 'We ship worldwide',
                detail: '7-14 business days. Rates calculated at checkout based on destination. Duties and taxes may apply.',
              },
              {
                icon: Shield,
                title: 'Insured Shipping',
                desc: 'Every order is protected',
                detail: 'All shipments include tracking and insurance at no extra cost.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 md:gap-6 border-b border-[var(--nc-border)] pb-8">
                <div className="flex-shrink-0 w-10 h-10 bg-[var(--nc-purple)]/10 flex items-center justify-center">
                  <item.icon size={20} className="text-[var(--nc-purple)]" />
                </div>
                <div>
                  <h3 className="font-display text-lg uppercase tracking-[0.02em] mb-1">{item.title}</h3>
                  <p className="text-xs text-[var(--nc-purple)] uppercase tracking-wider mb-2">{item.desc}</p>
                  <p className="text-sm text-[var(--nc-grey)] leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Processing Time */}
          <section className="mb-16">
            <h2 className="font-display text-xl uppercase tracking-[0.02em] mb-4">Order Processing</h2>
            <div className="bg-[var(--nc-offwhite)] p-6">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--nc-purple)] mt-0.5">1.</span>
                  <span>Orders placed before 2 PM EST are processed same-day.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--nc-purple)] mt-0.5">2.</span>
                  <span>Orders placed after 2 PM EST are processed next business day.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--nc-purple)] mt-0.5">3.</span>
                  <span>You will receive a tracking number via email once your order ships.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--nc-purple)] mt-0.5">4.</span>
                  <span>Weekend and holiday orders are processed on the next business day.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Restrictions */}
          <section>
            <h2 className="font-display text-xl uppercase tracking-[0.02em] mb-4">Shipping Restrictions</h2>
            <p className="text-sm text-[var(--nc-grey)] leading-relaxed">
              We do not ship to PO boxes for high-value orders (over $500). 
              Some restricted items cannot be shipped internationally due to customs regulations. 
              If your order cannot be shipped to your location, you will be notified within 24 hours 
              and receive a full refund.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
