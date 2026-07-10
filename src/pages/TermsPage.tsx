import { Link } from 'react-router-dom';
import MetaTags from '@/components/seo/MetaTags';

export default function TermsPage() {
  return (
    <>
      <MetaTags
        title="Terms of Service"
        description="Terms of Service for NonChalant. By using our website, you agree to these terms."
        url="https://nonchalant.co/terms"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 pb-24">
          <nav className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] mb-8">
            <Link to="/" className="hover:text-[var(--nc-purple)] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--nc-text)]">Terms of Service</span>
          </nav>

          <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] mb-4">
            Terms of Service
          </h1>
          <p className="text-xs text-[var(--nc-grey)] mb-12">Last updated: July 10, 2025</p>

          <div className="space-y-10 text-sm leading-relaxed text-[var(--nc-text)]">
            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">1. Introduction</h2>
              <p className="text-[var(--nc-grey)]">
                Welcome to NonChalant. These Terms of Service govern your use of our website 
                and the purchase of products from our store. By accessing or using our website, 
                you agree to be bound by these terms. If you do not agree, please do not use our site.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">2. Use of Website</h2>
              <p className="text-[var(--nc-grey)]">
                You must be at least 18 years old to make purchases on this website. 
                You agree to provide accurate and complete information when creating an account 
                or placing an order. You are responsible for maintaining the confidentiality 
                of your account information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">3. Products & Pricing</h2>
              <p className="text-[var(--nc-grey)]">
                All products are subject to availability. We reserve the right to discontinue 
                any product at any time. Prices are listed in USD and are subject to change 
                without notice. In the event of a pricing error, we reserve the right to cancel 
                any orders placed at the incorrect price.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">4. Orders & Payment</h2>
              <p className="text-[var(--nc-grey)]">
                By placing an order, you agree to pay the full amount including applicable taxes 
                and shipping fees. All payments are processed securely through Shopify Payments. 
                We reserve the right to refuse or cancel any order for any reason including 
                suspicion of fraud or unauthorized activity.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">5. Shipping & Delivery</h2>
              <p className="text-[var(--nc-grey)]">
                Shipping timeframes are estimates and not guaranteed. Risk of loss and title 
                for items pass to you upon delivery to the carrier. We are not responsible 
                for delays caused by customs, weather, or carrier issues.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">6. Returns & Refunds</h2>
              <p className="text-[var(--nc-grey)]">
                Returns are accepted within 30 days of delivery. Items must be unworn with 
                original tags attached. Final sale items cannot be returned. See our{' '}
                <Link to="/returns" className="text-[var(--nc-purple)] hover:underline">Returns page</Link>{' '}
                for full details.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">7. Intellectual Property</h2>
              <p className="text-[var(--nc-grey)]">
                All content on this website including images, text, logos, and designs are the 
                property of NonChalant or our partners and are protected by copyright and 
                trademark laws. You may not reproduce, distribute, or use any content without 
                our express written permission.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">8. Limitation of Liability</h2>
              <p className="text-[var(--nc-grey)]">
                NonChalant shall not be liable for any indirect, incidental, special, or 
                consequential damages arising from your use of the website or purchase of products. 
                Our total liability shall not exceed the amount you paid for the specific product 
                giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">9. Governing Law</h2>
              <p className="text-[var(--nc-grey)]">
                These terms are governed by the laws of Singapore. Any disputes shall be 
                resolved in the courts of Singapore.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">10. Changes to Terms</h2>
              <p className="text-[var(--nc-grey)]">
                We reserve the right to update these terms at any time. Changes will be 
                effective immediately upon posting to this page. Your continued use of the 
                website constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">Contact</h2>
              <p className="text-[var(--nc-grey)]">
                Questions about these terms? Contact us at{' '}
                <a href="mailto:hello@nonchalant.co" className="text-[var(--nc-purple)] hover:underline">
                  hello@nonchalant.co
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
