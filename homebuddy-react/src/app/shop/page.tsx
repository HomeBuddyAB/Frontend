// app/shop/page.tsx
"use client";
import { fetchCategories } from '@/lib/api-client';
import { Item, itemService } from '@/lib/services/adminServices';
import type { Category } from '@/lib/shop-types';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function filterItemsBySearch(items: Item[], query: string): Item[] {
  if (!query.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter(
    (item) =>
      item.groupName?.toLowerCase().includes(q) ||
      item.mainCategory?.toLowerCase().includes(q) ||
      (item.slug && item.slug.toLowerCase().includes(q)) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      (item.color && item.color.toLowerCase().includes(q))
  );
}

export default function ShopLanding() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') ?? '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 12;

  const filteredItems = useMemo(() => filterItemsBySearch(allItems, urlSearch), [allItems, urlSearch]);

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
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [urlSearch]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedItems(filteredItems.slice(startIndex, endIndex));
  }, [currentPage, filteredItems]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('search', q);
    } else {
      params.delete('search');
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF3E0' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#F4A261] border-t-transparent"></div>
          <p className="text-lg font-bold" style={{ color: '#2D3E50' }}>Loading products...</p>
        </div>
      </main>
    );
  }

  if (categories.length === 0 && allItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-24 text-center min-h-screen" style={{ backgroundColor: '#FAF3E0' }}>
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">🏗️</div>
          <h2 className="text-3xl font-black mb-4" style={{ color: '#2D3E50' }}>Store Coming Soon</h2>
          <p className="text-lg mb-4" style={{ color: '#5A6C7D' }}>We're stocking up on amazing products for your home projects!</p>
          <p className="text-sm font-mono" style={{ color: '#8B9CAE' }}>API Connection: {process.env.NEXT_PUBLIC_API_URL || 'Not Set'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: '#FAF3E0' }}>
      {/* Header Section */}
      <div className="pt-32 pb-16 px-6 md:px-12 border-b-2" style={{ borderColor: '#E8DCC4' }}>
        <div className="container mx-auto">
          <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#FFD166', color: '#2D3E50' }}>
            <span className="text-sm font-bold">🛠️ Shop Our Collection</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight" style={{ color: '#2D3E50' }}>
            Find Everything You Need
          </h1>
          <p className="text-xl max-w-2xl leading-relaxed" style={{ color: '#5A6C7D' }}>
            Quality tools, materials, and supplies for every home improvement project. Professional-grade products at fair prices.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">

        {/* Category Pills - Bright & Friendly */}
        {categories.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#2D3E50' }}>Browse by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop/${encodeURIComponent(c.slug)}`}
                  className="px-6 py-3 rounded-full border-2 text-sm font-bold tracking-wide uppercase transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  style={{ 
                    borderColor: '#E8DCC4', 
                    color: '#2D3E50',
                    backgroundColor: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#F4A261';
                    e.currentTarget.style.color = '#F4A261';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E8DCC4';
                    e.currentTarget.style.color = '#2D3E50';
                  }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Product Grid - Clean & Modern */}
        {allItems.length > 0 && (
          <section>
            {/* Search bar */}
            <form onSubmit={handleSearchSubmit} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products by name, category, color..."
                  className="flex-1 px-4 py-3 rounded-lg border-2 text-base focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                  style={{ borderColor: '#E8DCC4', color: '#2D3E50', backgroundColor: '#FFFFFF' }}
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg font-bold text-sm tracking-wide uppercase whitespace-nowrap transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: '#F4A261', color: '#FFFFFF' }}
                >
                  Search
                </button>
              </div>
              {urlSearch && (
                <p className="mt-2 text-sm" style={{ color: '#5A6C7D' }}>
                  {filteredItems.length === 0
                    ? `No products found for "${urlSearch}". Try a different search.`
                    : `${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} for "${urlSearch}"`}
                </p>
              )}
            </form>

            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b-2" style={{ borderColor: '#E8DCC4' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#2D3E50' }}>
                {urlSearch ? 'Search results' : 'All Products'}
              </h2>
              <span className="text-sm font-medium" style={{ color: '#5A6C7D' }}>
                Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-16 text-center rounded-xl border-2" style={{ borderColor: '#E8DCC4', backgroundColor: '#FFFFFF' }}>
                <p className="text-lg font-medium mb-2" style={{ color: '#2D3E50' }}>No products match your search.</p>
                <p className="text-sm" style={{ color: '#5A6C7D' }}>Try a different keyword or clear the search to see all products.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {displayedItems.map((item) => {
                const categorySlug = item.mainCategory.toLowerCase().replace(/\s+/g, '-');
                const href = `/shop/${encodeURIComponent(categorySlug)}/${encodeURIComponent(item.slug)}?sku=${encodeURIComponent(item.sku)}`;

                return (
                  <Link key={item.id} href={href} className="group block">
                    {/* Card Container */}
                    <div className="bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col" style={{ borderColor: '#E8DCC4' }}>
                      {/* Image Container */}
                      <div className="relative aspect-square w-full overflow-hidden" style={{ backgroundColor: '#F5ECD4' }}>
                        {item.primaryImageUrl ? (
                          <Image
                            src={item.primaryImageUrl}
                            alt={item.groupName}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ color: '#8B9CAE' }}>
                            <div className="text-center">
                              <div className="text-4xl mb-2">📦</div>
                              <span className="text-xs font-medium">No image</span>
                            </div>
                          </div>
                        )}

                        {/* Out of Stock Overlay */}
                        {!item.inStock && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 62, 80, 0.85)' }}>
                            <div className="bg-white px-6 py-3 rounded-lg">
                              <span className="font-bold tracking-wider text-sm" style={{ color: '#E63946' }}>
                                OUT OF STOCK
                              </span>
                            </div>
                          </div>
                        )}

                        {/* "NEW" Badge */}
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-xs" style={{ backgroundColor: '#F4A261', color: '#FFFFFF' }}>
                          NEW
                        </div>

                        {/* Quick View Hint */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                          <div className="text-center py-3 font-bold uppercase text-xs tracking-widest rounded-lg" style={{ backgroundColor: '#F4A261', color: '#FFFFFF' }}>
                            View Details
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#F4A261] transition-colors duration-300" style={{ color: '#2D3E50' }}>
                            {item.groupName}
                          </h3>
                          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#8B9CAE' }}>
                            <span className="uppercase font-medium">{item.mainCategory}</span>
                            {item.moreVariantsCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-bold" style={{ color: '#F4A261' }}>
                                  +{item.moreVariantsCount} variants
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-2xl font-black" style={{ color: '#F4A261' }}>
                          ${item.price}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            )}

            {/* Pagination - Friendly Style */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-12 border-t-2" style={{ borderColor: '#E8DCC4' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-3 rounded-lg font-bold text-sm tracking-wide uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-1"
                  style={{ 
                    backgroundColor: currentPage === 1 ? '#E8DCC4' : '#F4A261',
                    color: '#FFFFFF'
                  }}
                >
                  ← Previous
                </button>

                <span className="px-4 py-2 rounded-lg font-bold text-sm" style={{ backgroundColor: '#FFFFFF', color: '#2D3E50', border: '2px solid #E8DCC4' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 rounded-lg font-bold text-sm tracking-wide uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-1"
                  style={{ 
                    backgroundColor: currentPage === totalPages ? '#E8DCC4' : '#F4A261',
                    color: '#FFFFFF'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}