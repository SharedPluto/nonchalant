import { Link } from 'react-router-dom';
import { ShieldCheck, Search, PackageCheck, Award } from 'lucide-react';
import MetaTags from '@/components/seo/MetaTags';

export default function AuthenticityPage() {
  return (
    <>
      <MetaTags
        title="Authenticity Guarantee"
        description="NonChalant Authenticity Guarantee. Every item is verified authentic. We source directly from brands and authorized retailers."
        url="https://nonchalant.co/authenticity"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 pb-24">
          <nav className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] mb-8">
            <Link to="/" className="hover:text-[var(--nc-purple)] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--nc-text)]">Authenticity Guarantee</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={28} className="text-[var(--nc-lime)]" />
            <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em]">
              Authenticity Guarantee
            </h1>
          </div>
          <p className="text-[var(--nc-grey)] mb-12 max-w-[500px]">
            Every item on NonChalant is verified authentic. No fakes. No exceptions. 
            We stake our reputation on it.
          </p>

          {/* Promise */}
          <section className="bg-[var(--nc-black)] text-[var(--nc-cream)] p-8 md:p-12 mb-16">
            <h2 className="font-display text-2xl uppercase tracking-[0.02em] mb-4">
              Our Promise to You
            </h2>
            <p className="text-[var(--nc-grey)] leading-relaxed mb-6">
              In a market flooded with counterfeits, we stand firm: every single item 
              that passes through NonChalant has been rigorously inspected and verified 
              as 100% authentic. We source directly from brands, authorized distributors, 
              and trusted resale partners — never from questionable sources.
            </p>
            <p className="text-[var(--nc-lime)] text-sm uppercase tracking-wider font-medium">
              If we sell it, it is real. Period.
            </p>
          </section>

          {/* Process */}
          <section className="mb-16">
            <h2 className="font-display text-xl uppercase tracking-[0.02em] mb-8">
              Our Verification Process
            </h2>
            <div className="space-y-8">
              {[
                {
                  icon: Search,
                  step: '01',
                  title: 'Source Verification',
                  desc: 'We only purchase from brands, authorized retailers, and vetted resale partners with proven track records. Every supplier undergoes a thorough credential check before we do business.',
                },
                {
                  icon: ShieldCheck,
                  step: '02',
                  title: 'Multi-Point Inspection',
                  desc: 'Each item is examined by our trained authentication team. We check stitching, materials, tags, packaging, serial numbers, and brand-specific details. For sneakers, we verify box labels, shoe trees, and even the smell of the materials.',
                },
                {
                  icon: PackageCheck,
                  step: '03',
                  title: 'Quality Control',
                  desc: 'After authentication, items undergo a quality inspection to ensure they meet our standards — no defects, correct sizing, and pristine condition. Only then are they approved for listing.',
                },
                {
                  icon: Award,
                  step: '04',
                  title: 'Secure Shipping',
                  desc: 'Items are carefully packaged with tamper-evident seals and shipped with full insurance and tracking. From our hands to yours, your product is protected every step of the way.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[var(--nc-purple)]/10 flex items-center justify-center">
                      <item.icon size={22} className="text-[var(--nc-purple)]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[var(--nc-purple)] text-xs font-medium">{item.step}</span>
                      <h3 className="font-display text-sm uppercase tracking-wider">{item.title}</h3>
                    </div>
                    <p className="text-sm text-[var(--nc-grey)] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What We Check */}
          <section className="mb-16">
            <h2 className="font-display text-xl uppercase tracking-[0.02em] mb-6">
              What We Check
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Brand labels and tags',
                'Serial numbers and SKU codes',
                'Material quality and texture',
                'Stitching patterns and construction',
                'Packaging and box details',
                'Hardware (zippers, buckles, eyelets)',
                'Embossing and printing quality',
                'Weight and proportions',
              ].map((check) => (
                <div key={check} className="flex items-center gap-3 border border-[var(--nc-border)] p-4">
                  <ShieldCheck size={16} className="text-[var(--nc-lime)] flex-shrink-0" />
                  <span className="text-sm">{check}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Guarantee */}
          <section className="bg-[var(--nc-offwhite)] p-8">
            <h2 className="font-display text-xl uppercase tracking-[0.02em] mb-4">
              Money-Back Guarantee
            </h2>
            <p className="text-sm text-[var(--nc-grey)] leading-relaxed mb-4">
              In the extremely unlikely event that an item you receive is determined to be 
              counterfeit by a recognized authentication service, we will provide a full refund 
              including shipping costs. We will also work with you to secure a replacement 
              authentic item at no additional cost.
            </p>
            <p className="text-sm text-[var(--nc-grey)]">
              To report an authenticity concern, contact us immediately at{' '}
              <a href="mailto:hello@nonchalant.co" className="text-[var(--nc-purple)] hover:underline">
                hello@nonchalant.co
              </a>{' '}
              with your order number and detailed photos of the item in question.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
