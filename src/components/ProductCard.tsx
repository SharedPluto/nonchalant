import { Link } from 'react-router-dom';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <Link
      to={`/product/${product.handle}`}
      className="group block bg-[var(--nc-card-bg)] overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 0.06}s`, animationFillMode: 'both' }}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--nc-offwhite)]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-[var(--nc-purple)] text-white text-[10px] uppercase tracking-wider px-2 py-1 font-medium">
              New
            </span>
          )}
          {product.originalPrice && (
            <span className="bg-[var(--nc-red)] text-white text-[10px] uppercase tracking-wider px-2 py-1 font-medium">
              Sale
            </span>
          )}
          {product.lowStock && !product.originalPrice && (
            <span className="bg-[var(--nc-lime)] text-[var(--nc-black)] text-[10px] uppercase tracking-wider px-2 py-1 font-medium">
              Low Stock
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--nc-grey)]">
          {product.brand}
        </p>
        <p className="text-sm font-medium mt-0.5 truncate text-[var(--nc-text)]">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-[var(--nc-text)]">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-[var(--nc-grey)] line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
