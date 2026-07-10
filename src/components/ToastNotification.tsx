import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  productName?: string;
  size?: string;
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, productName?: string, size?: string) {
  const toast: Toast = {
    id: Math.random().toString(36).slice(2),
    message,
    productName,
    size,
  };
  toastListeners.forEach((fn) => fn(toast));
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };
    toastListeners.push(handleToast);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handleToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[3000] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[var(--nc-text)] text-[var(--nc-bg)] px-5 py-3.5 shadow-xl flex items-start gap-3 min-w-[300px] max-w-[420px] animate-toast-in"
        >
          <div className="w-6 h-6 rounded-full bg-[var(--nc-purple)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium uppercase tracking-wider mb-0.5">
              {toast.message}
            </p>
            {toast.productName && (
              <p className="text-[11px] text-[var(--nc-grey)] truncate">
                {toast.productName}
                {toast.size && ` — Size ${toast.size}`}
              </p>
            )}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-[var(--nc-grey)] hover:text-[var(--nc-bg)] transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
