import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetaTags from '@/components/seo/MetaTags';
import ProductCard from '@/components/ProductCard';
import { useShopifyProducts } from '@/hooks/useShopifyProduct';
import { categories } from '@/data/products';
import { categoryLandingContent, getBrandLandingIntro } from '@/data/landingContent';
import { cleanDescription, SITE_URL } from '@/lib/seo';

type CollectionPageProps = {
  type: 'brand' | 'category';
};

export default function CollectionPage({ type }: CollectionPageProps) {
  const params = useParams<{ brandSlug?: string; categorySlug?: string }>();
  const slug = type === 'brand' ? params.brandSlug || '' : params.categorySlug || '';
  const { products, loading } = useShopifyProducts(50);

  const collection = useMemo(() => {
    if (type === 'category') {
      const content = categoryLandingContent[slug];
      if (!content) return null;
      const items = products.filter(product => product.categorySlug === slug);
      return { name: content.name, intro: content.intro, items };
    }

    const match = products.find(product => product.brandSlug === slug);
    if (!match) return null;
    const items = products.filter(product => product.brandSlug === slug);
    const productCategories = Array.from(new Set(items.map(product => product.category))).sort();
    return {
      name: match.brand,
      intro: getBrandLandingIntro(match.brand, productCategories),
      items,
    };
  }, [products, slug, type]);

  const basePath = type === 'brand' ? `/brands/${slug}` : `/categories/${slug}`;
  const canonical = `${SITE_URL}${basePath}`;
  const title = collection
    ? type === 'brand'
      ? `${collection.name} in Singapore`
      : `${collection.name} | Streetwear Singapore`
    : 'Collection Not Found';
  const description = collection
    ? cleanDescription(`${collection.intro} ${collection.items.length} products currently listed.`)
    : 'The requested NonChalant collection could not be found.';

  return (
    <>
      <MetaTags
        title={title}
        description={description}
        url={canonical}
        noindex={!loading && !collection}
        breadcrumbs={collection ? [
          { name: 'Home', path: '/' },
          { name: type === 'brand' ? 'Brands' : 'Categories', path: '/shop' },
          { name: collection.name, path: basePath },
        ] : undefined}
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[80px]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] mb-8">
            <Link to="/" className="hover:text-[var(--nc-purple)]">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-[var(--nc-purple)]">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--nc-text)]">{collection?.name || 'Not found'}</span>
          </nav>

          {collection ? (
            <>
              <header className="max-w-[760px] mb-10">
                <p className="text-eyebrow mb-3">{type === 'brand' ? 'Brand' : 'Category'}</p>
                <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em]">
                  {collection.name}
                </h1>
                <p className="mt-5 text-sm md:text-base leading-relaxed text-[var(--nc-grey)]">
                  {collection.intro}
                </p>
                <p className="mt-4 text-[11px] uppercase tracking-wider text-[var(--nc-text)]">
                  {collection.items.length} products
                </p>
              </header>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-10">
                {collection.items.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              <nav aria-label="Browse other categories" className="mt-16 border-t border-[var(--nc-border)] pt-8">
                <h2 className="text-[11px] uppercase tracking-wider mb-4">Browse by category</h2>
                <div className="flex flex-wrap gap-x-5 gap-y-3">
                  {categories.map(category => (
                    <Link
                      key={category.slug}
                      to={`/categories/${category.slug}`}
                      className="text-xs uppercase tracking-wider text-[var(--nc-grey)] hover:text-[var(--nc-purple)]"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </>
          ) : loading ? (
            <>
              <h1 className="font-display text-3xl uppercase">Loading collection</h1>
              <p className="mt-4 text-sm text-[var(--nc-grey)]">Loading the live Shopify catalogue…</p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl uppercase">Collection not found</h1>
              <p className="mt-4 text-sm text-[var(--nc-grey)]">This collection is not in the current catalogue.</p>
              <Link to="/shop" className="btn-primary inline-block mt-8 px-6 py-3">Browse all products</Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
