import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { brands, aesthetics, categories } from '@/data/products';
import { useShopifyProducts } from '@/hooks/useShopifyProduct';
import ProductCard from '@/components/ProductCard';
import MetaTags from '@/components/seo/MetaTags';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch from Shopify ONLY — no hardcoded fallback
  const { products, loading: shopifyLoading } = useShopifyProducts(50);

  // Get filter values from URL
  const aestheticFilter = searchParams.get('aesthetic') || '';
  const brandFilter = searchParams.get('brand') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sortValue = searchParams.get('sort') || 'newest';
  const saleOnly = searchParams.get('sale') === 'true';

  // Local filter states
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>(
    aestheticFilter ? [aestheticFilter] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    brandFilter ? [brandFilter] : []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFilter ? [categoryFilter] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sort, setSort] = useState(sortValue);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sync with URL params
  useEffect(() => {
    setSelectedAesthetics(aestheticFilter ? [aestheticFilter] : []);
    setSelectedBrands(brandFilter ? [brandFilter] : []);
    setSelectedCategories(categoryFilter ? [categoryFilter] : []);
    setSort(sortValue || 'newest');
  }, [aestheticFilter, brandFilter, categoryFilter, sortValue]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedAesthetics.length > 0) {
      result = result.filter(p => selectedAesthetics.includes(p.aestheticSlug));
    }
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brandSlug));
    }
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.categorySlug));
    }
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }
    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }
    if (saleOnly) {
      result = result.filter(p => p.originalPrice !== null);
    }

    // Sort
    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        break;
    }

    return result;
  }, [selectedAesthetics, selectedBrands, selectedCategories, selectedSizes, inStockOnly, saleOnly, sort]);

  // Toggle filter
  const toggleFilter = (value: string, _current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedAesthetics([]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedSizes([]);
    setInStockOnly(false);
    setSearchParams({});
  };

  // Apply filters to URL
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedAesthetics.length === 1) params.set('aesthetic', selectedAesthetics[0]);
    if (selectedBrands.length === 1) params.set('brand', selectedBrands[0]);
    if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
    if (sort !== 'newest') params.set('sort', sort);
    setSearchParams(params);
    setMobileFiltersOpen(false);
  };

  // Get page title and SEO description
  const getPageTitle = () => {
    if (aestheticFilter) return aesthetics.find(a => a.slug === aestheticFilter)?.name || 'Shop';
    if (brandFilter) return brands.find(b => b.slug === brandFilter)?.name || 'Shop';
    if (categoryFilter) return categories.find(c => c.slug === categoryFilter)?.name || 'Shop';
    if (saleOnly) return 'Sale';
    return 'All Products';
  };

  const getSeoDescription = () => {
    if (aestheticFilter) {
      const aesthetic = aesthetics.find(a => a.slug === aestheticFilter);
      return `Shop ${aesthetic?.name} streetwear at NonChalant. ${aesthetic?.subtitle}. Browse curated ${aesthetic?.name.toLowerCase()} clothing, shoes, and accessories from top brands.`;
    }
    if (brandFilter) {
      const brand = brands.find(b => b.slug === brandFilter);
      return `Shop ${brand?.name} at NonChalant. Browse the latest ${brand?.name} streetwear, sneakers, and accessories.`;
    }
    if (categoryFilter) {
      const category = categories.find(c => c.slug === categoryFilter);
      return `Shop ${category?.name.toLowerCase()} at NonChalant. Browse premium streetwear ${category?.name.toLowerCase()} from top brands.`;
    }
    return 'Browse all products at NonChalant. Premium streetwear, sneakers, and accessories from Nike, Adidas, Stone Island, Supreme, and more.';
  };

  // Active filter chips
  const activeFilters = [
    ...selectedAesthetics.map(a => ({ type: 'aesthetic', value: a, label: aesthetics.find(x => x.slug === a)?.name || a })),
    ...selectedBrands.map(b => ({ type: 'brand', value: b, label: brands.find(x => x.slug === b)?.name || b })),
    ...selectedCategories.map(c => ({ type: 'category', value: c, label: categories.find(x => x.slug === c)?.name || c })),
  ];

  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'];

  // Filter sidebar content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {activeFilters.map((f) => (
              <button
                key={`${f.type}-${f.value}`}
                onClick={() => {
                  if (f.type === 'aesthetic') toggleFilter(f.value, selectedAesthetics, setSelectedAesthetics);
                  if (f.type === 'brand') toggleFilter(f.value, selectedBrands, setSelectedBrands);
                  if (f.type === 'category') toggleFilter(f.value, selectedCategories, setSelectedCategories);
                }}
                className="flex items-center gap-1 bg-[var(--nc-offwhite)] px-3 py-1.5 text-xs"
              >
                {f.label}
                <X size={12} />
              </button>
            ))}
          </div>
          <button onClick={clearAllFilters} className="text-xs text-[var(--nc-grey)] hover:text-[var(--nc-purple)] uppercase tracking-wider">
            Clear All
          </button>
        </div>
      )}

      {/* Aesthetic */}
      <div>
        <h4 className="text-sm font-medium uppercase tracking-wider mb-3">Aesthetic</h4>
        <div className="space-y-2">
          {aesthetics.map(a => (
            <label key={a.slug} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => toggleFilter(a.slug, selectedAesthetics, setSelectedAesthetics)}
                className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                  selectedAesthetics.includes(a.slug)
                    ? 'bg-[var(--nc-purple)] border-[var(--nc-purple)]'
                    : 'border-[var(--nc-grey)]'
                }`}
              >
                {selectedAesthetics.includes(a.slug) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
              <span className="text-sm">{a.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="text-sm font-medium uppercase tracking-wider mb-3">Brand</h4>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {brands.map(b => (
            <label key={b.slug} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => toggleFilter(b.slug, selectedBrands, setSelectedBrands)}
                className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                  selectedBrands.includes(b.slug)
                    ? 'bg-[var(--nc-purple)] border-[var(--nc-purple)]'
                    : 'border-[var(--nc-grey)]'
                }`}
              >
                {selectedBrands.includes(b.slug) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
              <span className="text-sm">{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-sm font-medium uppercase tracking-wider mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map(c => (
            <label key={c.slug} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => toggleFilter(c.slug, selectedCategories, setSelectedCategories)}
                className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                  selectedCategories.includes(c.slug)
                    ? 'bg-[var(--nc-purple)] border-[var(--nc-purple)]'
                    : 'border-[var(--nc-grey)]'
                }`}
              >
                {selectedCategories.includes(c.slug) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
              <span className="text-sm">{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="text-sm font-medium uppercase tracking-wider mb-3">Size</h4>
        <div className="grid grid-cols-4 gap-2">
          {[...clothingSizes, ...shoeSizes].map(size => (
            <button
              key={size}
              onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
              className={`py-2 text-xs border transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-[var(--nc-purple)] text-white border-[var(--nc-purple)]'
                  : 'border-[var(--nc-border)] hover:border-[var(--nc-purple)]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-sm font-medium uppercase tracking-wider mb-3">Availability</h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-10 h-5 flex items-center transition-colors ${
              inStockOnly ? 'bg-[var(--nc-purple)]' : 'bg-[var(--nc-grey)]/30'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white shadow-sm transition-transform ${
                inStockOnly ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      <MetaTags
        title={getPageTitle()}
        description={getSeoDescription()}
        url={`https://nonchalant.co/shop${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
        type="website"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[80px]">
        {/* Page Hero */}
        <div className="border-b border-[var(--nc-border)]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
            {/* Breadcrumb */}
            <nav className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] mb-3">
              <Link to="/" className="hover:text-[var(--nc-purple)] transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-[var(--nc-text)]">Shop</span>
              {(aestheticFilter || brandFilter || categoryFilter) && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-[var(--nc-text)]">{getPageTitle()}</span>
                </>
              )}
            </nav>

            <div className="flex items-end justify-between">
              <h1 className="font-display text-2xl md:text-4xl uppercase tracking-[0.02em]">
                {getPageTitle()}
              </h1>
              <span className="text-sm text-[var(--nc-grey)] hidden md:block">
                Showing {filteredProducts.length} products
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
          <div className="flex gap-12">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[260px] flex-shrink-0">
              <FilterContent />
            </aside>

            {/* Mobile Filter Button + Product Area */}
            <div className="flex-1 min-w-0">
              {/* Sort + Mobile Filter */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 border border-[var(--nc-text)] px-4 py-2 text-xs uppercase tracking-wider"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </button>

                {/* Sort */}
                <div className="relative ml-auto">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none bg-transparent text-sm pr-8 cursor-pointer outline-none text-[var(--nc-text)]"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--nc-grey)]" />
                </div>
              </div>

              {/* Product Grid */}
              {shopifyLoading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="animate-pulse text-[var(--nc-grey)]">Loading products...</div>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <p className="text-[var(--nc-grey)] mb-4">No products available yet.</p>
                  <p className="text-sm text-[var(--nc-grey)]">Check back soon for new drops.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <p className="text-[var(--nc-grey)] mb-4">No products match your filters.</p>
                  <button onClick={clearAllFilters} className="btn-primary text-xs py-3 px-6">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <div
          className={`fixed inset-0 z-[1000] lg:hidden transition-opacity duration-300 ${
            mobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div
            className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-[var(--nc-bg)] overflow-y-auto p-6 transition-transform duration-300 ${
              mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium uppercase tracking-wider">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterContent />
            <button onClick={applyFilters} className="btn-primary w-full mt-8 text-xs py-4">
              Apply Filters
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
