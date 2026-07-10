import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import MetaTags from '@/components/seo/MetaTags';

export default function ReturnsPage() {
  return (
    <>
      <MetaTags
        title="Returns & Refunds"
        description="NonChalant return policy. 30-day returns on unworn items with original tags. Easy process, no hassle."
        url="https://nonchalant.co/returns"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 pb-24">
          <nav className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] mb-8">
            <Link to="/" className="hover:text-[var(--nc-purple)] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--nc-text)]">Returns</span>
          </nav>

          <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] mb-4">
            Returns & Refunds
          </h1>
          <p className="text-[var(--nc-grey)] mb-12">
            We want you to be completely satisfied. If something is not right, we make returns easy.
          </p>

          {/* Policy Highlights */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[
              { icon: Clock, title: '30-Day Window', desc: 'Return any item within 30 days of delivery for a full refund.' },
              { icon: Package, title: 'Free Returns', desc: 'We provide a prepaid return label for all domestic orders.' },
              { icon: CheckCircle, title: 'Full Refund', desc: 'Original payment method refunded within 5-7 business days of receiving your return.' },
              { icon: RotateCcw, title: 'Easy Process', desc: 'No questions asked. Just request a return and we will handle the rest.' },
            ].map((item) => (
              <div key={item.title} className="border border-[var(--nc-border)] p-6">
                <item.icon size={24} className="text-[var(--nc-purple)] mb-3" />
                <h3 className="font-medium text-sm uppercase tracking-wider mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--nc-grey)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </section>

          {/* What Can Be Returned */}
          <section className="mb-16">
            <h2 className="font-display text-xl uppercase tracking-[0.02em] mb-6">What Can Be Returned</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} className="text-[var(--nc-lime)]" />
                  <span className="text-sm font-medium uppercase tracking-wider">Accepted</span>
                </div>
                <ul className="space-y-2 text-sm text-[var(--nc-grey)]">
                  <li>Unworn items with original tags attached</li>
                  <li>Items in original packaging</li>
                  <li>Defective or damaged items (we cover shipping)</li>
                  <li>Incorrect items sent</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle size={16} className="text-[var(--nc-red)]" />
                  <span className="text-sm font-medium uppercase tracking-wider">Not Accepted</span>
                </div>
                <ul className="space-y-2 text-sm text-[var(--nc-grey)]">
                  <li>Worn, washed, or altered items</li>
                  <li>Items without original tags</li>
                  <li>Items returned after 30 days</li>
                  <li>Items marked as Final Sale</li>
                  <li>Underwear and socks (hygiene reasons)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Return */}
          <section className="mb-16">
            <h2 className="font-display text-xl uppercase tracking-[0.02em] mb-6">How to Return</h2>
            <div className="bg-[var(--nc-offwhite)] p-6 md:p-8">
              <ol className="space-y-6">
                {[
                  'Contact us at hello@nonchalant.co with your order number and reason for return.',
                  'We will send you a prepaid return label within 24 hours.',
                  'Pack the item securely in the original packaging with all tags attached.',
                  'Drop off the package at any authorized shipping location.',
                  'Once we receive and inspect your return, your refund will be processed within 5-7 business days.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-[var(--nc-purple)] text-white flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed pt-1.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Exchanges */}
          <section>
            <h2 className="font-display text-xl uppercase tracking-[0.02em] mb-4">Exchanges</h2>
            <p className="text-sm text-[var(--nc-grey)] leading-relaxed">
              We do not offer direct exchanges. If you need a different size or color, 
              please return the original item for a refund and place a new order. 
              This ensures you get the item you want before it sells out. 
              Contact us if you need help securing a replacement — we will do our best to hold 
              stock for you while your return is in transit.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
