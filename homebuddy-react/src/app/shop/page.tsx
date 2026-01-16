// app/shop/page.tsx
"use client";
import { fetchCategories } from '@/lib/api-client';
import { Item, itemService } from '@/lib/services/adminServices';
import type { Category } from '@/lib/shop-types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ShopLanding() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 12;

  const fetchAllItems = async (): Promise<Item[]> => {
    try {
      let pageNumber = 1;
      const pageSize = 30;
      let items: Item[] = [];
      let fetchedItems: Item[] = [];

      do {
        const response = await itemService.getAll(pageNumber, pageSize);
        if (response.status !== 200 || !response.data) {
          throw new Error('Failed to fetch items');
        }
        fetchedItems = response.data;
        items = items.concat(fetchedItems);
        pageNumber++;
      } while (fetchedItems.length === pageSize);

      return items;
    } catch (error) {
      console.error('Failed to fetch items:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, itemsData] = await Promise.all([
          fetchCategories().catch(() => []),
          fetchAllItems()
        ]);

        setCategories(categoriesData);
        setAllItems(itemsData);
        setDisplayedItems(itemsData.slice(0, itemsPerPage));
      } catch (err) {
        setError('Failed to load shop data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedItems(allItems.slice(startIndex, endIndex));
  }, [currentPage, allItems]);

  const totalPages = Math.ceil(allItems.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#171010' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B4513]"></div>
      </main>
    );
  }

  if (categories.length === 0 && allItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-24 text-center min-h-screen" style={{ backgroundColor: '#171010' }}>
        <p className="text-gray-400 mb-4 text-xl">Store is currently empty.</p>
        <p className="text-sm text-gray-600 font-mono">API Connection: {process.env.NEXT_PUBLIC_API_URL || 'Not Set'}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: '#171010' }}>
      {/* Header Section */}
      <div className="pt-32 pb-12 px-6 md:px-12 border-b border-[#362222]">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">THE SHOP</h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Raw materials. Industrial construction. Essentials for the road ahead.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">

        {/* Minimal Category Pills */}
        {categories.length > 0 && (
          <section className="mb-16">
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop/${encodeURIComponent(c.slug)}`}
                  className="px-6 py-2 rounded-full border border-[#362222] text-gray-400 text-sm font-bold tracking-widest uppercase hover:text-white hover:border-white hover:bg-[#201a1a] transition-all duration-300"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Product Grid - Gallery Style */}
        {allItems.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-8 border-b border-[#362222] pb-4">
              <span className="text-gray-500 font-mono text-xs">
                {((currentPage - 1) * itemsPerPage) + 1} — {Math.min(currentPage * itemsPerPage, allItems.length)} / {allItems.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 mb-24">
              {displayedItems.map((item) => {
                const categorySlug = item.mainCategory.toLowerCase().replace(/\s+/g, '-');
                const href = `/shop/${encodeURIComponent(categorySlug)}/${encodeURIComponent(item.slug)}?sku=${encodeURIComponent(item.sku)}`;

                return (
                  <Link key={item.id} href={href} className="group block">
                    {/* Image Container - Clean, no border */}
                    <div className="relative aspect-4/5 w-full overflow-hidden bg-[#201a1a] mb-6">
                      {item.primaryImageUrl ? (
                        <Image
                          src={item.primaryImageUrl}
                          alt={item.groupName}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#362222]">
                          <span className="font-mono text-xs">NO IMAGE</span>
                        </div>
                      )}

                      {/* Overlay Badges */}
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold tracking-widest border border-white px-4 py-2">
                            SOLD OUT
                          </span>
                        </div>
                      )}

                      {/* Quick Add / Hover Action (Optional visual cue) */}
                      <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        <div className="bg-white text-black text-center py-3 font-bold uppercase text-xs tracking-widest">
                          View Details
                        </div>
                      </div>
                    </div>

                    {/* Minimal Text Info */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-white font-bold uppercase tracking-wide text-lg group-hover:text-[#8B4513] transition-colors duration-300 line-clamp-1">
                          {item.groupName}
                        </h3>
                        <span className="text-gray-400 font-mono text-sm ml-4">
                          ${item.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-mono uppercase">
                        <span>{item.mainCategory}</span>
                        {item.moreVariantsCount > 0 && (
                          <>
                            <span>/</span>
                            <span className="text-[#8B4513]">
                              {item.moreVariantsCount} + Styles
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Minimal Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 pt-12 border-t border-[#362222]">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase text-sm tracking-widest font-bold"
                >
                  Prev
                </button>

                <span className="text-gray-400 font-mono text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase text-sm tracking-widest font-bold"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}