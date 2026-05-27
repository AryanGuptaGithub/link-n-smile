// app/products/page.tsx
'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Package, SlidersHorizontal, X } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  slug: string;
  category?: { _id: string; name: string; slug: string };
  stock: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="h-48 bg-stone-100 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-14 bg-stone-100 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-stone-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products?limit=100').then((r) => r.json()),
      fetch('/api/categories?flat=true').then((r) => r.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData.products || []);
        setCategories(categoriesData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category?._id === selectedCategory);
    }
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else {
      result.reverse();
    }
    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const activeFilters = (searchQuery ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0);
  const selectedCategoryName = categories.find((c) => c._id === selectedCategory)?.name;

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">
            LinkAndSmile
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">
            {selectedCategoryName ? selectedCategoryName : "All Products"}
          </h1>
          <p className="text-sm text-stone-400">
            {loading ? "Loading…" : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} from our curated collection`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">

        {/* ── Filter bar ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 mb-7">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_200px] gap-3 items-center">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl border-stone-200 focus:ring-amber-300 focus:border-amber-300 text-sm bg-stone-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-10 rounded-xl border-stone-200 text-sm bg-stone-50 focus:ring-amber-300">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-stone-200">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 rounded-xl border-stone-200 text-sm bg-stone-50 focus:ring-amber-300">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-stone-200">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low → High</SelectItem>
                <SelectItem value="price-high">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filter pills */}
          {activeFilters > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <div className="flex flex-wrap gap-2 flex-1">
                {searchQuery && (
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-100">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-amber-900 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && selectedCategoryName && (
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-100">
                    {selectedCategoryName}
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-amber-900 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-xs text-stone-400 hover:text-stone-600 font-medium transition-colors shrink-0"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-stone-100 overflow-hidden">
                <div className="aspect-square bg-stone-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 bg-stone-100 animate-pulse rounded-lg w-3/4" />
                  <div className="h-3 bg-stone-100 animate-pulse rounded-lg w-1/2" />
                  <div className="h-8 bg-stone-100 animate-pulse rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filteredProducts.map((product, i) => (
              <div
                key={product._id}
                style={{
                  opacity: 0,
                  animation: `productFadeIn 0.3s ease forwards`,
                  animationDelay: `${Math.min(i * 30, 300)}ms`,
                }}
              >
                <ProductCard
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  image={product.image}
                  slug={product.slug}
                  stock={product.stock}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-stone-200">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-stone-300" />
            </div>
            <h3 className="text-base font-bold text-stone-700 mb-1">No products found</h3>
            <p className="text-sm text-stone-400 text-center max-w-xs mb-5">
              Try adjusting your filters or search term to find what you're looking for.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes productFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}