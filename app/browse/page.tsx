'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/categories';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Brain,
  HeartHandshake,
  ClipboardList,
  Users,
  ShieldCheck,
  Eye,
  Shield,
  Briefcase,
  Palette,
  Layers,
  Activity,
  Frame,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain className="h-4 w-4" />,
  HeartHandshake: <HeartHandshake className="h-4 w-4" />,
  ClipboardList: <ClipboardList className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />,
  Eye: <Eye className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
  Layers: <Layers className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />,
  Frame: <Frame className="h-4 w-4" />,
};

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-500', label: 'Under $5' },
  { value: '500-1500', label: '$5 - $15' },
  { value: '1500-3000', label: '$15 - $30' },
  { value: '3000-5000', label: '$30 - $50' },
  { value: '5000-100000', label: '$50+' },
];

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, seller:users(*)')
      .eq('status', 'active');

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      const cat = CATEGORIES.find((c) => c.slug === category);
      if (cat) query = query.eq('category', cat.name);
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      query = query.gte('price_cents', min).lte('price_cents', max);
    }

    switch (sort) {
      case 'popular':
        query = query.order('download_count', { ascending: false });
        break;
      case 'price_low':
        query = query.order('price_cents', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price_cents', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data } = await query.limit(48);
    setProducts((data as Product[]) || []);
    setLoading(false);
  }, [search, category, sort, priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateParams() {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category) params.set('category', category);
    if (sort !== 'newest') params.set('sort', sort);
    if (priceRange) params.set('price', priceRange);
    router.push(`/browse?${params.toString()}`);
  }

  useEffect(() => {
    updateParams();
  }, [category, sort, priceRange]);

  const activeCategoryName = CATEGORIES.find((c) => c.slug === category)?.name;
  const activeFilterCount = [category, priceRange, search].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-navy mb-1 tracking-tight">
            {activeCategoryName || 'Browse Resources'}
          </h1>
          <p className="text-gray-500">
            {activeCategoryName
              ? `Explore ${activeCategoryName.toLowerCase()} from fellow therapists`
              : 'Find the perfect resources for your practice'}
          </p>

          {/* Search bar */}
          <form
            className="mt-6 max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              updateParams();
              fetchProducts();
            }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="pl-12 pr-28 py-3 text-base rounded-xl border-gray-200 focus:border-gold focus:ring-gold/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-navy hover:bg-navy-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-4">Categories</h3>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setCategory('')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      !category ? 'bg-navy text-white font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setCategory(cat.slug === category ? '' : cat.slug)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        category === cat.slug ? 'bg-navy text-white font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                      }`}
                    >
                      <span className={category === cat.slug ? 'text-gold' : 'text-gray-400'}>
                        {iconMap[cat.icon]}
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-4">Price Range</h3>
                <div className="space-y-0.5">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setPriceRange(range.value === priceRange ? '' : range.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        priceRange === range.value ? 'bg-navy text-white font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="h-5 w-5 rounded-full bg-gold text-white text-xs flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Results count */}
              <p className="hidden lg:block text-sm text-gray-500">
                {loading ? 'Searching...' : `${products.length} resource${products.length !== 1 ? 's' : ''} found`}
              </p>

              {/* Sort */}
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">{sortOptions.find(s => s.value === sort)?.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showSort && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lift border border-gray-100 py-1.5 z-10 animate-fade-in">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSort(option.value); setShowSort(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sort === option.value ? 'text-navy font-medium bg-gray-50' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile filters panel */}
            {showFilters && (
              <div className="lg:hidden mb-6 bg-white rounded-2xl border border-gray-100 p-5 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-navy uppercase tracking-wider">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Category chips */}
                <div className="mb-5">
                  <p className="text-xs font-medium text-gray-500 mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategory('')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        !category ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setCategory(cat.slug === category ? '' : cat.slug)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          category === cat.slug ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price chips */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Price</p>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => setPriceRange(range.value === priceRange ? '' : range.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          priceRange === range.value ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(category || priceRange || search) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-gray-400 font-medium">Active filters:</span>
                {category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy/5 rounded-full text-xs font-medium text-navy">
                    {activeCategoryName}
                    <button onClick={() => setCategory('')} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {priceRange && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy/5 rounded-full text-xs font-medium text-navy">
                    {priceRanges.find((p) => p.value === priceRange)?.label}
                    <button onClick={() => setPriceRange('')} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy/5 rounded-full text-xs font-medium text-navy">
                    &quot;{search}&quot;
                    <button onClick={() => { setSearch(''); fetchProducts(); }} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => { setCategory(''); setPriceRange(''); setSearch(''); }}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                    <div className="aspect-[4/3] skeleton-shimmer" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 skeleton-shimmer rounded-full w-1/3" />
                      <div className="h-4 skeleton-shimmer rounded-full w-3/4" />
                      <div className="h-4 skeleton-shimmer rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-600 text-lg font-medium mb-2">No resources found</p>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters</p>
                <Button
                  variant="outline"
                  onClick={() => { setCategory(''); setPriceRange(''); setSearch(''); }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
