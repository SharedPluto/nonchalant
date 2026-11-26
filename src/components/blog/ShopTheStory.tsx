import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';

function StoryProduct({ handle, index }: { handle: string; index: number }) {
  const navigate = useNavigate();
  const { product, loading, error } = useShopifyProduct(handle);

  if (loading) {
    return <div className="aspect-[3/4] animate-pulse bg-[var(--nc-offwhite)]" aria-label="Loading related product" />;
  }
  if (error || !product) return null;

  return (
    <ProductCard
      product={product}
      index={index + 6}
      onQuickView={productHandle => navigate(`/product/${productHandle}`)}
    />
  );
}

export default function ShopTheStory({ handles }: { handles: string[] }) {
  if (!handles.length) return null;

  return (
    <section className="border-t border-[var(--nc-border)] mt-20 pt-12" aria-labelledby="shop-the-story">
      <div className="mb-8">
        <p className="text-eyebrow mb-3">From the Journal</p>
        <h2 id="shop-the-story" className="font-display text-2xl md:text-3xl uppercase tracking-[0.02em]">
          Shop the story
        </h2>
        <p className="text-sm text-[var(--nc-grey)] mt-3">
          Explore pieces from the current NonChalant catalogue related to this story.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-8">
        {handles.map((handle, index) => <StoryProduct key={handle} handle={handle} index={index} />)}
      </div>
    </section>
  );
}
