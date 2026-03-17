// app/shop/page.tsx
"use client";
import { fetchCategories } from '@/lib/api-client';
import { Item, itemService } from '@/lib/services/adminServices';
import type { Category } from '@/lib/shop-types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PaginationBar from '@/components/PaginationBar';

const ITEMS_PER_PAGE = 12;

export default function ShopLanding() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') ?? '';
  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const searchTerm = urlSearch.trim() || undefined;
        const [categoriesData, response] = await Promise.all([
          fetchCategories().catch(() => []),
          itemService.getAll(pageFromUrl, ITEMS_PER_PAGE, searchTerm),
        ]);

        setCategories((prev) => (categoriesData.length > 0 ? categoriesData : prev));

        if (response.error || !response.data) {
          throw new Error(response.error ?? 'Failed to fetch products');
        }
        const paged = response.data;
        setItems(paged.items);
        setTotalCount(paged.totalCount);
        setTotalPages(paged.totalPages);
      } catch (err) {
        setError('Failed to load shop data');
        console.error(err);
        setItems([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [urlSearch, pageFromUrl]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    params.set('page', '1');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const paginationSearchParams: Record<string, string> = { page: String(pageFromUrl) };
  if (urlSearch) paginationSearchParams.search = urlSearch;

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

  if (categories.length === 0 && items.length === 0 && totalCount === 0) {
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
                  className="px-6 py-3 rounded-full border-2 text-sm font-bold tracking-wide transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
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
                  {totalCount === 0
                    ? `No products found for "${urlSearch}". Try a different search.`
                    : `${totalCount} result${totalCount !== 1 ? 's' : ''} for "${urlSearch}"`}
                </p>
              )}
            </form>

            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b-2" style={{ borderColor: '#E8DCC4' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#2D3E50' }}>
                {urlSearch ? 'Search results' : 'All Products'}
              </h2>
              <span className="text-sm font-medium" style={{ color: '#5A6C7D' }}>
                Showing {totalCount === 0 ? 0 : (pageFromUrl - 1) * ITEMS_PER_PAGE + 1}–{Math.min(pageFromUrl * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </span>
            </div>

            {items.length === 0 && !isLoading ? (
              <div className="py-16 text-center rounded-xl border-2" style={{ borderColor: '#E8DCC4', backgroundColor: '#FFFFFF' }}>
                <p className="text-lg font-medium mb-2" style={{ color: '#2D3E50' }}>No products match your search.</p>
                <p className="text-sm" style={{ color: '#5A6C7D' }}>Try a different keyword or clear the search to see all products.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {items.map((item) => {
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
                            <span className="font-medium">{item.mainCategory}</span>
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

            <PaginationBar
              currentPage={pageFromUrl}
              totalPages={totalPages}
              basePath={pathname}
              searchParams={paginationSearchParams}
              totalCount={totalCount}
              pageSize={ITEMS_PER_PAGE}
            />
        </section>
      </div>
    </main>
  );
}