import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { brands, aesthetics, categories } from '@/data/products';
import { useShopifyProducts } from '@/hooks/useShopifyProduct';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import FloatingFilterPill from '@/components/FloatingFilterPill';
import MetaTags from '@/components/seo/MetaTags';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const categoryTabs = [
  { slug: '', label: 'All Products' },
  { slug: 'shoes', label: 'Shoes' },
  { slug: 'tops', label: 'Tops' },
  { slug: 'bottoms', label: 'Bottoms' },
  { slug: 'jackets', label: 'Jackets' },
  { slug: 'bags', label: 'Bags' },
  { slug: 'accessories', label: 'Accessories' },
];

type ActiveFilter = {
  type: 'tag' | 'sale' | 'aesthetic' | 'brand' | 'category' | 'size' | 'stock';
  value: string;
  label: string;
};

const getParamValues = (params: URLSearchParams, key: string) => {
  const values = params.getAll(key).flatMap(value => value.split(','));
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)));
};

const setParamValues = (params: URLSearchParams, key: string, values: string[]) => {
  params.delete(key);
  values.forEach(value => params.append(key, value));
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [quickViewHandle, setQuickViewHandle] = useState<string | null>(null);
  const { scrollDirection, scrollY } = useScrollDirection();

  const tabBarHidden = scrollDirection === 'down' && scrollY > 200;

  // Fetch from Shopify ONLY
  const { products, loading: shopifyLoading } = useShopifyProducts(50);

  // Applied filters always come from the URL. This keeps chips, tabs, reloads,
  // shared links, and the rendered product grid synchronized.
  const selectedAesthetics = getParamValues(searchParams, 'aesthetic');
  const selectedBrands = getParamValues(searchParams, 'brand');
  const selectedCategories = getParamValues(searchParams, 'category');
  const selectedSizes = getParamValues(searchParams, 'size');
  const tagFilter = searchParams.get('tag') || '';
  const saleOnly = searchParams.get('sale') === 'true';
  const inStockOnly = searchParams.get('stock') === 'in-stock';
  const sortValue = searchParams.get('sort') || 'newest';
  const sort = sortOptions.some(option => option.value === sortValue) ? sortValue : 'newest';

  const aestheticFilter = selectedAesthetics.length === 1 ? selectedAesthetics[0] : '';
  const brandFilter = selectedBrands.length === 1 ? selectedBrands[0] : '';
  const categoryFilter = selectedCategories.length === 1 ? selectedCategories[0] : '';

  // Brand options come from actual Shopify Vendor values instead of a fixed
  // subset. Existing curated names are reused where their slugs match.
  const shopBrands = useMemo(() => {
    const brandMap = new Map<string, { name: string; slug: string }>();
    products.forEach(product => {
      if (!product.brandSlug || brandMap.has(product.brandSlug)) return;
      const curatedBrand = brands.find(brand => brand.slug === product.brandSlug);
      brandMap.set(product.brandSlug, {
        name: curatedBrand?.name || product.brand,
        slug: product.brandSlug,
      });
    });
    return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // Draft selections are used only inside the filter drawer. Closing the
  // drawer discards them; Apply writes them to the URL in one operation.
  const [draftAesthetics, setDraftAesthetics] = useState<string[]>([]);
  const [draftBrands, setDraftBrands] = useState<string[]>([]);
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [draftSizes, setDraftSizes] = useState<string[]>([]);
  const [draftInStockOnly, setDraftInStockOnly] = useState(false);

  const openFilterPanel = () => {
    setDraftAesthetics([...selectedAesthetics]);
    setDraftBrands([...selectedBrands]);
    setDraftCategories([...selectedCategories]);
    setDraftSizes([...selectedSizes]);
    setDraftInStockOnly(inStockOnly);
    setFilterPanelOpen(true);
  };

  const toggleDraftFilter = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter(previous => previous.includes(value)
      ? previous.filter(item => item !== value)
      : [...previous, value]);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedAesthetics.length > 0) {
      result = result.filter(product => selectedAesthetics.includes(product.aestheticSlug));
    }
    if (selectedBrands.length > 0) {
      result = result.filter(product => selectedBrands.includes(product.brandSlug));
    }
    if (selectedCategories.length > 0) {
      result = result.filter(product => selectedCategories.includes(product.categorySlug));
    }
    if (selectedSizes.length > 0) {
      result = result.filter(product => product.sizes.some(size => selectedSizes.includes(size)));
    }
    if (inStockOnly) {
      result = result.filter(product => product.inStock);
    }
    if (saleOnly) {
      result = result.filter(product => product.originalPrice !== null);
    }
    if (tagFilter === 'new') {
      result = result.filter(product => product.isNew);
    }

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
    }

    return result;
  }, [selectedAesthetics, selectedBrands, selectedCategories, selectedSizes, inStockOnly, saleOnly, tagFilter, sort, products]);

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (sort !== 'newest') params.set('sort', sort);
    setSearchParams(params);
  };

  const setCategoryTab = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    if (slug) params.set('category', slug);
    setSearchParams(params);
  };

  const toggleNewArrivals = () => {
    const params = new URLSearchParams(searchParams);
    if (tagFilter === 'new') params.delete('tag');
    else params.set('tag', 'new');
    setSearchParams(params);
  };

  const toggleSale = () => {
    const params = new URLSearchParams(searchParams);
    if (saleOnly) params.delete('sale');
    else params.set('sale', 'true');
    setSearchParams(params);
  };

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'newest') params.delete('sort');
    else params.set('sort', value);
    setSearchParams(params);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    setParamValues(params, 'aesthetic', draftAesthetics);
    setParamValues(params, 'brand', draftBrands);
    setParamValues(params, 'category', draftCategories);
    setParamValues(params, 'size', draftSizes);
    if (draftInStockOnly) params.set('stock', 'in-stock');
    else params.delete('stock');
    setSearchParams(params);
    setFilterPanelOpen(false);
  };

  const removeFilter = (filter: ActiveFilter) => {
    const params = new URLSearchParams(searchParams);

    if (filter.type === 'tag') params.delete('tag');
    else if (filter.type === 'sale') params.delete('sale');
    else if (filter.type === 'stock') params.delete('stock');
    else {
      const key = filter.type === 'size' ? 'size' : filter.type;
      const remaining = getParamValues(params, key).filter(value => value !== filter.value);
      setParamValues(params, key, remaining);
    }

    setSearchParams(params);
  };

  const getPageTitle = () => {
    if (tagFilter === 'new') return "What's New";
    if (categoryFilter) return categories.find(category => category.slug === categoryFilter)?.name || 'Shop';
    if (aestheticFilter) return aesthetics.find(aesthetic => aesthetic.slug === aestheticFilter)?.name || 'Shop';
    if (brandFilter) return shopBrands.find(brand => brand.slug === brandFilter)?.name || 'Shop';
    if (saleOnly) return 'Sale';
    return 'All Products';
  };

  const getSeoDescription = () => {
    if (tagFilter === 'new') {
      return "Shop the latest drops at NonChalant. New arrivals from Nike, Adidas, Stone Island, Supreme, and more. Updated regularly.";
    }
    if (categoryFilter) {
      const category = categories.find(item => item.slug === categoryFilter);
      return `Shop ${category?.name.toLowerCase()} at NonChalant. Browse premium streetwear ${category?.name.toLowerCase()} from top brands.`;
    }
    if (aestheticFilter) {
      const aesthetic = aesthetics.find(item => item.slug === aestheticFilter);
      return `Shop ${aesthetic?.name} streetwear at NonChalant. ${aesthetic?.subtitle}.`;
    }
    if (brandFilter) {
      const brand = shopBrands.find(item => item.slug === brandFilter);
      return `Shop ${brand?.name} at NonChalant. Browse the latest ${brand?.name} streetwear, sneakers, and accessories.`;
    }
    return 'Browse all products at NonChalant. Premium streetwear, sneakers, and accessories from Nike, Adidas, Stone Island, Supreme, and more.';
  };

  const activeFilters: ActiveFilter[] = [
    ...(tagFilter === 'new' ? [{ type: 'tag' as const, value: 'new', label: "What's New" }] : []),
    ...(saleOnly ? [{ type: 'sale' as const, value: 'true', label: 'Sale' }] : []),
    ...selectedAesthetics.map(value => ({
      type: 'aesthetic' as const,
      value,
      label: aesthetics.find(item => item.slug === value)?.name || value,
    })),
    ...selectedBrands.map(value => ({
      type: 'brand' as const,
      value,
      label: shopBrands.find(item => item.slug === value)?.name || value,
    })),
    ...selectedCategories.map(value => ({
      type: 'category' as const,
      value,
      label: categories.find(item => item.slug === value)?.name || value,
    })),
    ...selectedSizes.map(value => ({ type: 'size' as const, value, label: `Size: ${value}` })),
    ...(inStockOnly ? [{ type: 'stock' as const, value: 'in-stock', label: 'In Stock' }] : []),
  ];

  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'];

  const activeFilterCount = activeFilters.length;
  const hasQueryState = searchParams.toString().length > 0;
  const canonicalPath = categoryFilter
    ? `/categories/${categoryFilter}`
    : brandFilter
      ? `/brands/${brandFilter}`
      : '/shop';

  return (
    <>
      <MetaTags
        title={getPageTitle()}
        description={getSeoDescription()}
        url={`https://nonchalantstore.com${canonicalPath}`}
        type="website"
        noindex={hasQueryState}
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[60px]">
        <h1 className="sr-only">{getPageTitle()} | Streetwear & Sneakers in Singapore</h1>
        {/* Sticky Nav + Toolbar — hides together on scroll down */}
        <div className={`sticky top-[60px] z-10 bg-[var(--nc-bg)] border-b border-[var(--nc-border)] transition-transform duration-300 ease-out ${tabBarHidden ? '-translate-y-full' : 'translate-y-0'}`}>
          {/* Category Tab Bar */}
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
              {categoryTabs.map(tab => (
                <button
                  key={tab.slug}
                  onClick={() => setCategoryTab(tab.slug)}
                  className={`whitespace-nowrap text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 transition-colors duration-200 ${
                    (selectedCategories.length === 1 && categoryFilter === tab.slug) || (selectedCategories.length === 0 && !tab.slug)
                      ? 'text-[var(--nc-purple)] font-medium'
                      : 'text-[var(--nc-grey)] hover:text-[var(--nc-text)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={toggleNewArrivals}
                className={`whitespace-nowrap text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 transition-colors duration-200 ${
                  tagFilter === 'new'
                    ? 'text-[var(--nc-purple)] font-medium'
                    : 'text-[var(--nc-grey)] hover:text-[var(--nc-text)]'
                }`}
              >
                New Arrivals
              </button>
              <button
                onClick={toggleSale}
                className={`whitespace-nowrap text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 transition-colors duration-200 ${
                  saleOnly
                    ? 'text-[var(--nc-purple)] font-medium'
                    : 'text-[var(--nc-grey)] hover:text-[var(--nc-text)]'
                }`}
              >
                Sale
              </button>
            </div>
          </div>

          {/* Toolbar: Active Filters + Sort + Filter Button */}
          <div className="border-t border-[var(--nc-border)]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Active filter chips */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
                {activeFilters.length > 0 ? (
                  <>
                    {activeFilters.map(f => (
                      <button
                        key={`${f.type}-${f.value}`}
                        onClick={() => removeFilter(f)}
                        className="flex items-center gap-1 bg-[var(--nc-offwhite)] border border-[var(--nc-border)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--nc-text)] hover:border-[var(--nc-purple)] transition-colors flex-shrink-0"
                      >
                        {f.label}
                        <X size={10} />
                      </button>
                    ))}
                    <button
                      onClick={clearAllFilters}
                      className="text-[10px] uppercase tracking-wider text-[var(--nc-grey)] hover:text-[var(--nc-purple)] transition-colors flex-shrink-0"
                    >
                      Clear All
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-[var(--nc-grey)]">
                    {filteredProducts.length} products
                  </span>
                )}
              </div>

              {/* Right: Sort + Filter button */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => updateSort(e.target.value)}
                    className="appearance-none bg-transparent text-[11px] uppercase tracking-wider pr-6 cursor-pointer outline-none text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--nc-grey)]" />
                </div>

                {/* Divider */}
                <div className="w-px h-3 bg-[var(--nc-border)]" />

                {/* Filter button */}
                <button
                  onClick={openFilterPanel}
                  className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors"
                >
                  <SlidersHorizontal size={13} />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Product Grid — Full width, no sidebar, dense */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
          {shopifyLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-pulse text-[var(--nc-grey)] text-sm">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <p className="text-[var(--nc-grey)] mb-4">No products available yet.</p>
              <p className="text-sm text-[var(--nc-grey)]">Check back soon for new drops.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <p className="text-[var(--nc-grey)] mb-4">No products match your filters.</p>
              <button onClick={clearAllFilters} className="text-xs uppercase tracking-wider text-[var(--nc-purple)] hover:underline py-3 px-6 border border-[var(--nc-purple)]">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-10">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onQuickView={setQuickViewHandle}
                />
              ))}
            </div>
          )}
        </div>

        {/* Filter Panel — slides in from right, overlay */}
        <div
          className={`fixed inset-0 z-[1000] transition-opacity duration-300 ${
            filterPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setFilterPanelOpen(false)} />

          {/* Panel */}
          <div
            className={`absolute top-0 right-0 bottom-0 w-full max-w-[380px] bg-[var(--nc-bg)] overflow-y-auto transition-transform duration-300 ${
              filterPanelOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Panel Header */}
            <div className="sticky top-0 z-10 bg-[var(--nc-bg)] border-b border-[var(--nc-border)] px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-wider">Filters</h3>
              <button
                onClick={() => setFilterPanelOpen(false)}
                className="text-[var(--nc-text)] hover:text-[var(--nc-purple)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Panel Content */}
            <div className="px-6 py-6 space-y-8">
              {/* Aesthetic */}
              <div>
                <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] mb-4 text-[var(--nc-grey)]">Aesthetic</h4>
                <div className="space-y-2.5">
                  {aesthetics.map(a => (
                    <label key={a.slug} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleDraftFilter(a.slug, setDraftAesthetics)}
                        className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                          draftAesthetics.includes(a.slug)
                            ? 'bg-[var(--nc-purple)] border-[var(--nc-purple)]'
                            : 'border-[var(--nc-grey)] group-hover:border-[var(--nc-text)]'
                        }`}
                      >
                        {draftAesthetics.includes(a.slug) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px]">{a.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--nc-border)]" />

              {/* Brand */}
              <div>
                <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] mb-4 text-[var(--nc-grey)]">Brand</h4>
                <div className="space-y-2.5 max-h-[240px] overflow-y-auto scrollbar-hide">
                  {shopBrands.map(b => (
                    <label key={b.slug} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleDraftFilter(b.slug, setDraftBrands)}
                        className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                          draftBrands.includes(b.slug)
                            ? 'bg-[var(--nc-purple)] border-[var(--nc-purple)]'
                            : 'border-[var(--nc-grey)] group-hover:border-[var(--nc-text)]'
                        }`}
                      >
                        {draftBrands.includes(b.slug) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px]">{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--nc-border)]" />

              {/* Size */}
              <div>
                <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] mb-4 text-[var(--nc-grey)]">Size</h4>
                <div className="grid grid-cols-5 gap-2">
                  {[...clothingSizes, ...shoeSizes].map(size => (
                    <button
                      key={size}
                      onClick={() => toggleDraftFilter(size, setDraftSizes)}
                      className={`py-2 text-[11px] border transition-colors ${
                        draftSizes.includes(size)
                          ? 'bg-[var(--nc-purple)] text-white border-[var(--nc-purple)]'
                          : 'border-[var(--nc-border)] hover:border-[var(--nc-purple)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--nc-border)]" />

              {/* Availability */}
              <div>
                <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] mb-4 text-[var(--nc-grey)]">Availability</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setDraftInStockOnly(!draftInStockOnly)}
                    className={`w-10 h-5 flex items-center transition-colors cursor-pointer ${
                      draftInStockOnly ? 'bg-[var(--nc-purple)]' : 'bg-[var(--nc-grey)]/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white shadow-sm transition-transform ${
                        draftInStockOnly ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-[13px]">In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Panel Footer — Sticky Apply */}
            <div className="sticky bottom-0 bg-[var(--nc-bg)] border-t border-[var(--nc-border)] px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  clearAllFilters();
                  setFilterPanelOpen(false);
                }}
                className="flex-1 py-3 text-[11px] uppercase tracking-wider border border-[var(--nc-border)] hover:border-[var(--nc-text)] transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-3 text-[11px] uppercase tracking-wider bg-[var(--nc-purple)] text-white hover:opacity-90 transition-opacity"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Floating Filter Pill — Mobile only */}
        <FloatingFilterPill
          onClick={openFilterPanel}
          activeFilterCount={activeFilterCount}
        />

        {/* Quick View Modal */}
        <QuickViewModal
          productHandle={quickViewHandle}
          onClose={() => setQuickViewHandle(null)}
        />
      </main>
    </>
  );
}
