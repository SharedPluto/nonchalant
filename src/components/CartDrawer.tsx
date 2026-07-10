import { useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useShopifyCartStore } from '@/stores/shopifyCartStore';

function getCheckoutUrlWithReturn(checkoutUrl: string | null): string {
  if (!checkoutUrl) return '#';
  const returnUrl = `${window.location.origin}${window.location.pathname}`;
  const separator = checkoutUrl.includes('?') ? '&' : '?';
  return `${checkoutUrl}${separator}return_to=${encodeURIComponent(returnUrl)}`;
}

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, subtotal, checkoutUrl, isLoading } = useShopifyCartStore();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, setOpen]);

  return (
    <div
      className={`fixed inset-0 z-[1000] transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-full max-w-[420px] bg-[var(--nc-bg)] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--nc-border)]">
          <h2 className="text-sm font-medium uppercase tracking-[0.05em]">Your Bag</h2>
          <button onClick={() => setOpen(false)} className="text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60%] px-6">
            <ShoppingBag size={48} className="text-[var(--nc-grey)] mb-4" />
            <p className="text-[var(--nc-grey)] mb-4">Your bag is empty</p>
            <button onClick={() => setOpen(false)} className="btn-primary text-xs py-3 px-6">
              START SHOPPING
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-24 bg-[var(--nc-offwhite)] flex-shrink-0 overflow-hidden">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--nc-grey)]">
                      {item.product.brand}
                    </p>
                    <p className="text-sm font-medium mt-0.5 truncate">{item.product.name}</p>
                    <p className="text-xs text-[var(--nc-grey)] mt-0.5">Size: {item.size}</p>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={isLoading}
                        className="w-7 h-7 border border-[var(--nc-border)] flex items-center justify-center hover:border-[var(--nc-purple)] transition-colors disabled:opacity-50"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={isLoading}
                        className="w-7 h-7 border border-[var(--nc-border)] flex items-center justify-center hover:border-[var(--nc-purple)] transition-colors disabled:opacity-50"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      disabled={isLoading}
                      className="text-[var(--nc-grey)] hover:text-[var(--nc-red)] transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                    <p className="text-sm font-medium">${item.product.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-[var(--nc-bg)] border-t border-[var(--nc-border)]">
              <div className="flex justify-between mb-4">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm font-medium">${subtotal()}</span>
              </div>
              {checkoutUrl ? (
                <a
                  href={getCheckoutUrlWithReturn(checkoutUrl)}
                  className="btn-primary w-full text-xs py-4 flex items-center justify-center"
                >
                  CHECKOUT
                </a>
              ) : (
                <button className="btn-primary w-full text-xs py-4" disabled>
                  CHECKOUT
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-full mt-3 text-xs uppercase tracking-[0.05em] text-[var(--nc-grey)] hover:text-[var(--nc-purple)] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
