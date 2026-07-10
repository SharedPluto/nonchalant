import { Link } from 'react-router-dom';
import MetaTags from '@/components/seo/MetaTags';

export default function PrivacyPage() {
  return (
    <>
      <MetaTags
        title="Privacy Policy"
        description="Privacy Policy for NonChalant. How we collect, use, and protect your personal information."
        url="https://nonchalant.co/privacy"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 pb-24">
          <nav className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] mb-8">
            <Link to="/" className="hover:text-[var(--nc-purple)] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--nc-text)]">Privacy Policy</span>
          </nav>

          <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] mb-4">
            Privacy Policy
          </h1>
          <p className="text-xs text-[var(--nc-grey)] mb-12">Last updated: July 10, 2025</p>

          <div className="space-y-10 text-sm leading-relaxed text-[var(--nc-text)]">
            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">1. Information We Collect</h2>
              <p className="text-[var(--nc-grey)] mb-3">
                We collect the following types of information:
              </p>
              <ul className="space-y-2 text-[var(--nc-grey)] ml-4">
                <li><strong>Personal Information:</strong> Name, email address, shipping address, billing address, phone number.</li>
                <li><strong>Payment Information:</strong> Processed securely through Shopify Payments. We do not store your credit card details.</li>
                <li><strong>Order History:</strong> Products purchased, order dates, and transaction amounts.</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and pages visited.</li>
                <li><strong>Cookies:</strong> We use cookies to enhance your browsing experience and remember your preferences.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">2. How We Use Your Information</h2>
              <p className="text-[var(--nc-grey)] mb-3">
                We use your information to:
              </p>
              <ul className="space-y-2 text-[var(--nc-grey)] ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate about your order status</li>
                <li>Send marketing emails (only if you opt in)</li>
                <li>Improve our website and customer experience</li>
                <li>Prevent fraud and unauthorized transactions</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">3. Information Sharing</h2>
              <p className="text-[var(--nc-grey)]">
                We do not sell your personal information. We only share data with trusted 
                third parties necessary to operate our business: Shopify (e-commerce platform), 
                payment processors, shipping carriers, and email service providers. 
                These parties are contractually obligated to protect your data.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">4. Data Security</h2>
              <p className="text-[var(--nc-grey)]">
                We implement industry-standard security measures to protect your data 
                including SSL encryption, secure servers, and regular security audits. 
                However, no method of transmission over the internet is 100% secure. 
                We cannot guarantee absolute security but strive to protect your information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">5. Your Rights</h2>
              <p className="text-[var(--nc-grey)] mb-3">
                You have the right to:
              </p>
              <ul className="space-y-2 text-[var(--nc-grey)] ml-4">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt out of marketing communications at any time</li>
                <li>Request a copy of your data in a portable format</li>
              </ul>
              <p className="text-[var(--nc-grey)] mt-3">
                To exercise these rights, contact us at{' '}
                <a href="mailto:hello@nonchalant.co" className="text-[var(--nc-purple)] hover:underline">
                  hello@nonchalant.co
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">6. Cookies</h2>
              <p className="text-[var(--nc-grey)]">
                We use cookies to improve your experience, remember your preferences, 
                and analyze website traffic. You can control cookies through your browser settings. 
                Disabling cookies may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">7. Third-Party Links</h2>
              <p className="text-[var(--nc-grey)]">
                Our website may contain links to third-party sites. We are not responsible 
                for the privacy practices of these sites. We encourage you to read their 
                privacy policies before providing any personal information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">8. Changes to This Policy</h2>
              <p className="text-[var(--nc-grey)]">
                We may update this Privacy Policy from time to time. Changes will be posted 
                on this page with an updated date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase tracking-[0.02em] mb-3">Contact</h2>
              <p className="text-[var(--nc-grey)]">
                For privacy-related questions or data requests, contact us at{' '}
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
