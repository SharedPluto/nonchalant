import { useState, useEffect } from 'react';
import { X, Bell, Check, Mail } from 'lucide-react';
import { useWaitlistStore } from '@/stores/waitlistStore';

export default function WaitlistModal() {
  const { isModalOpen, targetProduct, targetSize, closeModal, addEntry } = useWaitlistStore();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setEmail('');
      setResult(null);
      setSubmitting(false);
    }
  }, [isModalOpen]);

  if (!isModalOpen || !targetProduct) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setSubmitting(true);
    const response = await addEntry(email);
    setResult(response);
    setSubmitting(false);
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
      <div className="relative bg-[var(--nc-bg)] w-full max-w-[420px] shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-[var(--nc-grey)] hover:text-[var(--nc-text)] transition-colors"
        >
          <X size={18} />
        </button>

        {result?.success ? (
          /* ===== SUCCESS STATE — Big, bold, unmistakable ===== */
          <div className="flex flex-col items-center text-center px-8 py-10">
            {/* Large animated checkmark */}
            <div className="w-16 h-16 rounded-full bg-[var(--nc-purple)] flex items-center justify-center mb-5 animate-success-pop">
              <Check size={32} className="text-white" strokeWidth={3} />
            </div>

            {/* Confirmed heading */}
            <h3 className="text-lg font-medium uppercase tracking-wider mb-2 text-[var(--nc-text)]">
              You're All Set
            </h3>

            {/* Product confirmation */}
            <p className="text-[14px] text-[var(--nc-text)] font-medium mb-1">
              {targetProduct.name}
            </p>
            {targetSize && (
              <p className="text-[12px] text-[var(--nc-purple)] uppercase tracking-wider mb-3">
                Size {targetSize}
              </p>
            )}

            {/* Success message */}
            <div className="bg-[var(--nc-offwhite)] border border-[var(--nc-purple)]/20 px-5 py-3 mb-5 max-w-[320px]">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Mail size={14} className="text-[var(--nc-purple)]" />
                <span className="text-[12px] font-medium text-[var(--nc-text)]">
                  Email Confirmed
                </span>
              </div>
              <p className="text-[12px] text-[var(--nc-grey)] leading-relaxed">
                {result.message}
              </p>
            </div>

            {/* What happens next */}
            <p className="text-[11px] text-[var(--nc-grey)] mb-6 max-w-[280px] leading-relaxed">
              We'll email you the moment this item is back in stock. No spam, just a single notification.
            </p>

            {/* Done button */}
            <button
              onClick={handleClose}
              className="px-10 py-3 bg-[var(--nc-purple)] text-white text-[11px] uppercase tracking-wider font-medium hover:opacity-90 transition-opacity"
            >
              Got It
            </button>
          </div>
        ) : (
          /* ===== FORM STATE ===== */
          <div className="flex flex-col items-center text-center px-8 py-8">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-[var(--nc-purple)]/10 flex items-center justify-center mb-4">
              <Bell size={20} className="text-[var(--nc-purple)]" />
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium uppercase tracking-wider mb-1">
              Notify Me
            </h3>

            {/* Product name */}
            <p className="text-[13px] text-[var(--nc-text)] font-medium mb-1">
              {targetProduct.name}
            </p>

            {/* Size */}
            {targetSize && (
              <p className="text-[11px] text-[var(--nc-purple)] uppercase tracking-wider mb-4">
                Size {targetSize}
              </p>
            )}

            <p className="text-[12px] text-[var(--nc-grey)] mb-6 max-w-[280px]">
              Enter your email and we'll let you know when this item is back in stock.
            </p>

            {/* Error message */}
            {result && !result.success && (
              <div className="w-full bg-[var(--nc-red)]/10 border border-[var(--nc-red)]/20 px-4 py-2 mb-3">
                <p className="text-[var(--nc-red)] text-[12px]">{result.message}</p>
              </div>
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
                className="w-full py-3.5 bg-[var(--nc-purple)] text-white text-[11px] uppercase tracking-wider font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Bell size={14} />
                    Notify Me
                  </>
                )}
              </button>
            </form>

            <p className="text-[10px] text-[var(--nc-grey)] mt-4">
              We respect your privacy. One email per restock. Unsubscribe anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
