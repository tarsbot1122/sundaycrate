export const dynamic = "force-dynamic";
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/categories';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
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

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
  ];

  const activeCategoryName = CATEGORIES.find((c) => c.slug === category)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">
          {activeCategoryName || 'Browse Resources'}
        </h1>
        <p className="text-gray-600">
          {activeCategoryName
            ? `Explore ${activeCategoryName.toLowerCase()} from fellow therapists`
            : 'Find the perfect resources for your practice'}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <form
          className="flex-1 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            updateParams();
            fetchProducts();
          }}
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 text-sm font-medium text-navy"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        <div className={`flex flex-col sm:flex-row gap-3 ${showFilters ? '' : 'hidden lg:flex'}`}>
          <Select
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Select
            options={priceRanges}
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          />
          <Select
            options={sortOptions}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
        </div>
      </div>

      {/* Active Filters */}
      {(category || priceRange || search) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy/5 rounded-full text-sm text-navy">
              {activeCategoryName}
              <button onClick={() => setCategory('')}><X className="h-3 w-3" /></button>
            </span>
          )}
          {priceRange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy/5 rounded-full text-sm text-navy">
              {priceRanges.find((p) => p.value === priceRange)?.label}
              <button onClick={() => setPriceRange('')}><X className="h-3 w-3" /></button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy/5 rounded-full text-sm text-navy">
              &quot;{search}&quot;
              <button onClick={() => { setSearch(''); fetchProducts(); }}><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No resources found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
