import { useState } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { useWaitlistStore } from '@/stores/waitlistStore';

export default function WaitlistModal() {
  const { isModalOpen, targetProduct, targetSize, closeModal, addEntry } = useWaitlistStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isModalOpen || !targetProduct) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    addEntry(email);
    setSubmitted(true);
    setEmail('');
    setTimeout(() => {
      setSubmitted(false);
      closeModal();
    }, 2000);
  };

  const handleClose = () => {
    setEmail('');
    setSubmitted(false);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--nc-bg)] w-full max-w-[420px] p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--nc-grey)] hover:text-[var(--nc-text)] transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[var(--nc-purple)]/10 flex items-center justify-center mb-4">
              <Check size={24} className="text-[var(--nc-purple)]" />
            </div>
            <h3 className="text-sm font-medium uppercase tracking-wider mb-2">
              You're on the list
            </h3>
            <p className="text-[13px] text-[var(--nc-grey)]">
              We'll email you when this item is back in stock.
            </p>
          </div>
        ) : (
          /* Form state */
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-[var(--nc-purple)]/10 flex items-center justify-center mb-4">
              <Bell size={20} className="text-[var(--nc-purple)]" />
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium uppercase tracking-wider mb-1">
              Notify Me
            </h3>

            {/* Product name */}
            <p className="text-[13px] text-[var(--nc-text)] mb-1">
              {targetProduct.name}
            </p>
            {targetSize && (
              <p className="text-[11px] text-[var(--nc-grey)] mb-4">
                Size: {targetSize}
              </p>
            )}

            <p className="text-[12px] text-[var(--nc-grey)] mb-6 max-w-[280px]">
              Enter your email and we'll let you know when this item is back in stock.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[var(--nc-offwhite)] border border-[var(--nc-border)] text-[13px] placeholder:text-[var(--nc-grey)] outline-none focus:border-[var(--nc-purple)] transition-colors mb-3"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-[var(--nc-purple)] text-white text-[11px] uppercase tracking-wider font-medium hover:opacity-90 transition-opacity"
              >
                Notify Me
              </button>
            </form>

            <p className="text-[10px] text-[var(--nc-grey)] mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
