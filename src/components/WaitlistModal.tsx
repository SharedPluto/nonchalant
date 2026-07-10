import { useState } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { useWaitlistStore } from '@/stores/waitlistStore';

export default function WaitlistModal() {
  const { isModalOpen, targetProduct, closeModal, addEntry } = useWaitlistStore();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isModalOpen || !targetProduct) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setSubmitting(true);
    const response = await addEntry(email);
    setResult(response);
    setSubmitting(false);

    // Auto-close after showing success for 2.5 seconds
    if (response.success) {
      setTimeout(() => {
        setResult(null);
        setEmail('');
        closeModal();
      }, 2500);
    }
  };

  const handleClose = () => {
    setEmail('');
    setResult(null);
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

        {result?.success ? (
          /* Success state */
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[var(--nc-purple)]/10 flex items-center justify-center mb-4">
              <Check size={24} className="text-[var(--nc-purple)]" />
            </div>
            <h3 className="text-sm font-medium uppercase tracking-wider mb-2">
              You're on the list
            </h3>
            <p className="text-[13px] text-[var(--nc-grey)]">
              {result.message}
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

            {/* Size */}
            {useWaitlistStore.getState().targetSize && (
              <p className="text-[11px] text-[var(--nc-grey)] mb-4">
                Size: {useWaitlistStore.getState().targetSize}
              </p>
            )}

            <p className="text-[12px] text-[var(--nc-grey)] mb-6 max-w-[280px]">
              Enter your email and we'll let you know when this item is back in stock.
            </p>

            {/* Error message */}
            {result && !result.success && (
              <p className="text-[var(--nc-red)] text-[12px] mb-3">{result.message}</p>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[var(--nc-offwhite)] border border-[var(--nc-border)] text-[13px] placeholder:text-[var(--nc-grey)] outline-none focus:border-[var(--nc-purple)] transition-colors mb-3"
                required
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[var(--nc-purple)] text-white text-[11px] uppercase tracking-wider font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Notify Me'
                )}
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
