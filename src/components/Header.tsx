import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Moon, Sun, Menu, X } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useShopifyCartStore } from '@/stores/shopifyCartStore';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function Header() {
  const { mode, toggle } = useThemeStore();
  const { itemCount, toggleOpen } = useShopifyCartStore();
  const { scrollDirection, scrollY } = useScrollDirection();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isScrolled = scrollY > 100;
  const isHidden = scrollDirection === 'down' && scrollY > 200;

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] h-[60px] transition-all duration-300 ${
          isHidden && !mobileOpen ? '-translate-y-full' : 'translate-y-0'
        } ${
          isScrolled
            ? 'bg-[var(--nc-bg)] border-b border-[var(--nc-border)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="24" fontFamily="Geist, system-ui" fontWeight="700" fontSize="22">
                <tspan fill="#8A8A8A">N</tspan><tspan fill="#6200EA">C</tspan>
              </text>
            </svg>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/shop"
              className="text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors duration-300"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors duration-300"
            >
              About
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors duration-300"
              aria-label="Toggle theme"
            >
              {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Cart */}
            <button
              onClick={toggleOpen}
              className="relative text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors duration-300"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {itemCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--nc-purple)] text-white text-[10px] font-medium flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[var(--nc-text)]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div
        className={`fixed inset-0 z-[999] transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-[var(--nc-bg)] transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 pt-20 flex flex-col gap-6">
            <Link
              to="/shop"
              className="text-lg font-medium uppercase tracking-[0.05em] text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-lg font-medium uppercase tracking-[0.05em] text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors"
            >
              About
            </Link>
            <button
              onClick={() => {
                toggle();
              }}
              className="flex items-center gap-3 text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors"
            >
              {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span className="text-sm uppercase tracking-[0.05em]">
                {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
