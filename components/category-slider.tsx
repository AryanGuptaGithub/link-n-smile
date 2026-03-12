'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export function CategorySlider() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories?flat=true');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data.filter((c: any) => c.isActive !== false));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 overflow-x-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 md:w-40 space-y-3">
              <Skeleton className="h-32 md:h-40 w-full rounded-2xl" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
          <p className="text-gray-500 mt-1">Discover products curated for your needs</p>
        </div>
        <Link href="/products" className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-all hover:gap-2">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative group">
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x no-scrollbar">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-28 md:w-36 snap-start"
            >
              <Link 
                href={`/products?category=${category._id}`}
                className="group block text-center space-y-3"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-purple-50 group-hover:ring-4 group-hover:ring-purple-100 transition-all duration-300">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-400">
                      <span className="text-2xl font-bold">{category.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
