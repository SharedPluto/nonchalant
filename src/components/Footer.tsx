import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[var(--nc-black)] text-[var(--nc-cream)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-12">
          {/* Brand Column */}
          <div>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="24" fontFamily="Geist, system-ui" fontWeight="700" fontSize="22">
                <tspan fill="#8A8A8A">N</tspan><tspan fill="#6200EA">C</tspan>
              </text>
            </svg>
            <p className="mt-3 text-sm italic text-[var(--nc-cream)]/70 font-accent">
              Style Without The Effort
            </p>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--nc-grey)] mb-3">
                Stay in the loop
              </p>
              {subscribed ? (
                <p className="text-sm text-[var(--nc-purple)]">You&apos;re in. Welcome to NonChalant.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full bg-[var(--nc-dark-surface)] border border-[var(--nc-dark-border)] px-4 py-3 text-sm text-[var(--nc-cream)] placeholder:text-[var(--nc-grey)] focus:border-[var(--nc-purple)] outline-none transition-colors"
                    required
                  />
                  <button type="submit" className="btn-primary w-full text-xs py-3">
                    SUBSCRIBE
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.1em] text-[var(--nc-cream)] mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', to: '/shop' },
                { label: 'New Arrivals', to: '/shop?sort=newest' },
                { label: 'Sale', to: '/shop?sale=true' },
                { label: 'By Aesthetic', to: '/shop' },
                { label: 'By Brand', to: '/shop' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-[var(--nc-grey)] hover:text-[var(--nc-lime)] transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.1em] text-[var(--nc-cream)] mb-4">
              Help
            </h4>
            <ul className="space-y-3">
              {['Shipping', 'Returns', 'FAQ', 'Contact', 'Size Guide'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[var(--nc-grey)] hover:text-[var(--nc-lime)] transition-colors duration-300 cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.1em] text-[var(--nc-cream)] mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {['Instagram', 'Twitter / X', 'TikTok'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[var(--nc-grey)] hover:text-[var(--nc-lime)] transition-colors duration-300 cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            {/* Payment icons */}
            <div className="mt-8 flex items-center gap-3">
              {['VISA', 'MC', 'AMEX', 'APPLE'].map((p) => (
                <div
                  key={p}
                  className="w-8 h-5 bg-[var(--nc-grey)]/20 flex items-center justify-center text-[8px] text-[var(--nc-grey)]"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[var(--nc-dark-border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-[var(--nc-grey)]">
            &copy; 2025 NonChalant. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[var(--nc-grey)] hover:text-[var(--nc-cream)] cursor-pointer transition-colors">
              Terms
            </span>
            <span className="text-[11px] text-[var(--nc-grey)] hover:text-[var(--nc-cream)] cursor-pointer transition-colors">
              Privacy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
