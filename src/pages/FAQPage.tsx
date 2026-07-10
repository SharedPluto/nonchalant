import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import MetaTags from '@/components/seo/MetaTags';

const faqs = [
  {
    q: 'How do I know if an item is authentic?',
    a: 'Every item on NonChalant is verified authentic before it reaches you. We source directly from brands and authorized retailers. Each product undergoes a multi-point inspection process. See our Authenticity Guarantee page for full details.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. International orders take 7-14 business days. All orders are processed within 1-2 business days.',
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 30 days of delivery. Items must be unworn with original tags attached. Returns are free for domestic orders. Refunds are processed within 5-7 business days of receiving your return.',
  },
  {
    q: 'How do I find my size?',
    a: 'Check our Size Guide page for detailed measurements and international size conversions. Different brands may fit differently — we include brand-specific sizing notes on each product page.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes, we ship worldwide. International shipping takes 7-14 business days. Rates are calculated at checkout based on your destination. Please note that duties and taxes may apply depending on your country.',
  },
  {
    q: 'Can I cancel or modify my order?',
    a: 'Orders can be cancelled or modified within 2 hours of placing them. Contact us immediately at hello@nonchalant.co with your order number. Once an order enters processing, we cannot guarantee changes.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and Shop Pay. All transactions are processed securely through Shopify Payments.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order ships, you will receive a tracking number via email. You can also contact us at hello@nonchalant.co with your order number for tracking assistance.',
  },
  {
    q: 'Do you offer student or military discounts?',
    a: 'We occasionally run promotions and limited-time discounts. Sign up for our newsletter to be the first to know about sales and exclusive drops.',
  },
  {
    q: 'How can I contact customer service?',
    a: 'Email us at hello@nonchalant.co or use the contact form on our About page. We aim to respond to all inquiries within 24 hours during business days.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <MetaTags
        title="FAQ"
        description="Frequently asked questions about NonChalant. Shipping, returns, sizing, authenticity, and more."
        url="https://nonchalant.co/faq"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 pb-24">
          <nav className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] mb-8">
            <Link to="/" className="hover:text-[var(--nc-purple)] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--nc-text)]">FAQ</span>
          </nav>

          <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-[var(--nc-grey)] mb-12">
            Everything you need to know. Cannot find what you are looking for? Contact us at{' '}
            <a href="mailto:hello@nonchalant.co" className="text-[var(--nc-purple)] hover:underline">
              hello@nonchalant.co
            </a>
          </p>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-t border-[var(--nc-border)]">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`flex-shrink-0 text-[var(--nc-grey)] transition-transform duration-200 ${
                      openIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === i ? 'max-h-48 pb-5' : 'max-h-0'
                  }`}
                >
                  <p className="text-sm text-[var(--nc-grey)] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
