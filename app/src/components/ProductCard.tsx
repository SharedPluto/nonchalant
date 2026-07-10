import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Bell } from 'lucide-react';
import { useWaitlistStore } from '@/stores/waitlistStore';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView?: (handle: string) => void;
}

export default function ProductCard({ product, index = 0, onQuickView }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { openModal } = useWaitlistStore();

  const handleNotifyMe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openModal(
      {
        handle: product.handle,
        name: product.name,
        image: product.images[0],
      }
    );
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product.handle);
  };

  return (
    <Link
      to={`/product/${product.handle}`}
      className="group block"
      style={{ animationDelay: `${index * 0.04}s`, animationFillMode: 'both' }}
    >
      {/* Image — clean, no borders, no background card */}
      <div className="relative aspect-[3/4] bg-[var(--nc-offwhite)] overflow-hidden mb-2.5">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-[var(--nc-offwhite)]" />
        )}

        {/* Subtle badges — top right, minimal, always visible */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.originalPrice && (
            <span className="bg-[var(--nc-red)] text-white text-[9px] uppercase tracking-wider px-1.5 py-0.5 font-medium">
              Sale
            </span>
          )}
          {product.isNew && !product.originalPrice && (
            <span className="bg-[var(--nc-purple)] text-white text-[9px] uppercase tracking-wider px-1.5 py-0.5 font-medium">
              New
            </span>
          )}
        </div>

        {/* Hover overlay — Quick View / Notify Me buttons */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          {product.inStock ? (
            /* In stock — Quick View button */
            <button
              onClick={handleQuickView}
              className="flex items-center gap-1.5 bg-[var(--nc-bg)] text-[var(--nc-text)] px-4 py-2 text-[10px] uppercase tracking-wider font-medium shadow-lg hover:bg-[var(--nc-purple)] hover:text-white transition-colors"
            >
              <Eye size={13} />
              Quick View
            </button>
          ) : (
            /* Sold out — Notify Me button */
            <button
              onClick={handleNotifyMe}
              className="flex items-center gap-1.5 bg-[var(--nc-text)] text-[var(--nc-bg)] px-4 py-2 text-[10px] uppercase tracking-wider font-medium shadow-lg hover:bg-[var(--nc-purple)] hover:text-white transition-colors"
            >
              <Bell size={13} />
              Notify Me
            </button>
          )}
        </div>
      </div>

      {/* Product Info — Palace-style: name only by default, brand+price reveal on hover */}
      <div className="relative">
        {/* Product Name — always visible */}
        <p className="text-[12px] font-medium text-[var(--nc-text)] leading-tight truncate">
          {product.name}
        </p>

        {/* Sold out label — shown inline when out of stock */}
        {!product.inStock && (
          <p className="text-[10px] uppercase tracking-wider text-[var(--nc-grey)] mt-0.5">
            Sold Out
          </p>
        )}

        {/* Brand + Price — hidden by default, fade in on hover (only for in-stock items) */}
        {product.inStock && (
          <div className="flex items-center justify-between opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--nc-grey)]">
              {product.brand}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--nc-text)]">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] text-[var(--nc-grey)] line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
