import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { brands, aesthetics, categories } from '@/data/products';
import { useShopifyProducts } from '@/hooks/useShopifyProduct';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import WaitlistModal from '@/components/WaitlistModal';
import FloatingFilterPill from '@/components/FloatingFilterPill';
import MetaTags from '@/components/seo/MetaTags';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
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

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [quickViewHandle, setQuickViewHandle] = useState<string | null>(null);
  const { scrollDirection, scrollY } = useScrollDirection();

  const tabBarHidden = scrollDirection === 'down' && scrollY > 200;

  // Fetch from Shopify ONLY
  const { products, loading: shopifyLoading } = useShopifyProducts(50);

  // Get filter values from URL
  const aestheticFilter = searchParams.get('aesthetic') || '';
  const brandFilter = searchParams.get('brand') || '';
  const categoryFilter = searchParams.get('category') || '';
  const tagFilter = searchParams.get('tag') || '';
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
    if (tagFilter === 'new') {
      result = result.filter(p => p.isNew);
    }

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
  }, [selectedAesthetics, selectedBrands, selectedCategories, selectedSizes, inStockOnly, saleOnly, tagFilter, sort, products]);

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
    const params = new URLSearchParams();
    if (sort !== 'newest') params.set('sort', sort);
    setSearchParams(params);
  };

  // Set category via tab
  const setCategoryTab = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  // Apply filters from panel
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedAesthetics.length === 1) params.set('aesthetic', selectedAesthetics[0]);
    if (selectedBrands.length === 1) params.set('brand', selectedBrands[0]);
    if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
    if (sort !== 'newest') params.set('sort', sort);
    setSearchParams(params);
    setFilterPanelOpen(false);
  };

  // Get page title
  const getPageTitle = () => {
    if (tagFilter === 'new') return "What's New";
    if (categoryFilter) return categories.find(c => c.slug === categoryFilter)?.name || 'Shop';
    if (aestheticFilter) return aesthetics.find(a => a.slug === aestheticFilter)?.name || 'Shop';
    if (brandFilter) return brands.find(b => b.slug === brandFilter)?.name || 'Shop';
    if (saleOnly) return 'Sale';
    return 'All Products';
  };

  const getSeoDescription = () => {
    if (tagFilter === 'new') {
      return "Shop the latest drops at NonChalant. New arrivals from Nike, Adidas, Stone Island, Supreme, and more. Updated regularly.";
    }
    if (categoryFilter) {
      const category = categories.find(c => c.slug === categoryFilter);
      return `Shop ${category?.name.toLowerCase()} at NonChalant. Browse premium streetwear ${category?.name.toLowerCase()} from top brands.`;
    }
    if (aestheticFilter) {
      const aesthetic = aesthetics.find(a => a.slug === aestheticFilter);
      return `Shop ${aesthetic?.name} streetwear at NonChalant. ${aesthetic?.subtitle}.`;
    }
    if (brandFilter) {
      const brand = brands.find(b => b.slug === brandFilter);
      return `Shop ${brand?.name} at NonChalant. Browse the latest ${brand?.name} streetwear, sneakers, and accessories.`;
    }
    return 'Browse all products at NonChalant. Premium streetwear, sneakers, and accessories from Nike, Adidas, Stone Island, Supreme, and more.';
  };

  // Active filter chips
  const activeFilters = [
    ...(tagFilter === 'new' ? [{ type: 'tag', value: 'new', label: "What's New" }] : []),
    ...selectedAesthetics.map(a => ({ type: 'aesthetic', value: a, label: aesthetics.find(x => x.slug === a)?.name || a })),
    ...selectedBrands.map(b => ({ type: 'brand', value: b, label: brands.find(x => x.slug === b)?.name || b })),
    ...selectedCategories.map(c => ({ type: 'category', value: c, label: categories.find(x => x.slug === c)?.name || c })),
  ];

  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'];

  // Active filter count for floating pill badge
  const activeFilterCount = activeFilters.length + selectedSizes.length + (inStockOnly ? 1 : 0);

  return (
    <>
      <MetaTags
        title={getPageTitle()}
        description={getSeoDescription()}
        url={`https://nonchalant.co/shop${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
        type="website"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[60px]">
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
                    (categoryFilter === tab.slug) || (!categoryFilter && !tab.slug)
                      ? 'text-[var(--nc-purple)] font-medium'
                      : 'text-[var(--nc-grey)] hover:text-[var(--nc-text)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <Link
                to="/shop?tag=new"
                className={`whitespace-nowrap text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 transition-colors duration-200 ${
                  tagFilter === 'new'
                    ? 'text-[var(--nc-purple)] font-medium'
                    : 'text-[var(--nc-grey)] hover:text-[var(--nc-text)]'
                }`}
              >
                New Arrivals
              </Link>
              <Link
                to="/shop?sale=true"
                className={`whitespace-nowrap text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 transition-colors duration-200 ${
                  saleOnly
                    ? 'text-[var(--nc-purple)] font-medium'
                    : 'text-[var(--nc-grey)] hover:text-[var(--nc-text)]'
                }`}
              >
                Sale
              </Link>
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
                        onClick={() => {
                          if (f.type === 'tag') {
                            const params = new URLSearchParams(searchParams);
                            params.delete('tag');
                            setSearchParams(params);
                          }
                          if (f.type === 'aesthetic') toggleFilter(f.value, selectedAesthetics, setSelectedAesthetics);
                          if (f.type === 'brand') toggleFilter(f.value, selectedBrands, setSelectedBrands);
                          if (f.type === 'category') toggleFilter(f.value, selectedCategories, setSelectedCategories);
                        }}
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
                    onChange={(e) => setSort(e.target.value)}
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
                  onClick={() => setFilterPanelOpen(true)}
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
                        onClick={() => toggleFilter(a.slug, selectedAesthetics, setSelectedAesthetics)}
                        className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                          selectedAesthetics.includes(a.slug)
                            ? 'bg-[var(--nc-purple)] border-[var(--nc-purple)]'
                            : 'border-[var(--nc-grey)] group-hover:border-[var(--nc-text)]'
                        }`}
                      >
                        {selectedAesthetics.includes(a.slug) && (
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
                  {brands.map(b => (
                    <label key={b.slug} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleFilter(b.slug, selectedBrands, setSelectedBrands)}
                        className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                          selectedBrands.includes(b.slug)
                            ? 'bg-[var(--nc-purple)] border-[var(--nc-purple)]'
                            : 'border-[var(--nc-grey)] group-hover:border-[var(--nc-text)]'
                        }`}
                      >
                        {selectedBrands.includes(b.slug) && (
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
                      onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                      className={`py-2 text-[11px] border transition-colors ${
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

              {/* Divider */}
              <div className="border-t border-[var(--nc-border)]" />

              {/* Availability */}
              <div>
                <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] mb-4 text-[var(--nc-grey)]">Availability</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`w-10 h-5 flex items-center transition-colors cursor-pointer ${
                      inStockOnly ? 'bg-[var(--nc-purple)]' : 'bg-[var(--nc-grey)]/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white shadow-sm transition-transform ${
                        inStockOnly ? 'translate-x-5' : 'translate-x-0.5'
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
          onClick={() => setFilterPanelOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Quick View Modal */}
        <QuickViewModal
          productHandle={quickViewHandle}
          onClose={() => setQuickViewHandle(null)}
        />

        {/* Waitlist Modal */}
        <WaitlistModal />
      </main>
    </>
  );
}
