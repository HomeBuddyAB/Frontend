"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Item, itemService } from "@/lib/services/adminServices";
import PaginationBar from "@/components/PaginationBar";

const ITEMS_PER_PAGE = 12;

export default function DealsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

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
        const response = await itemService.getDeals(pageFromUrl, ITEMS_PER_PAGE, searchTerm);
        if (response.error || !response.data) {
          throw new Error(response.error ?? "Failed to fetch deals");
        }
        const paged = response.data;
        setItems(paged.items);
        setTotalCount(paged.totalCount);
        setTotalPages(paged.totalPages);
      } catch (err) {
        console.error(err);
        setError("Failed to load deals");
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
    if (q) params.set("search", q);
    params.set("page", "1");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const paginationSearchParams: Record<string, string> = { page: String(pageFromUrl) };
  if (urlSearch) paginationSearchParams.search = urlSearch;

  if (isLoading) {
    return (
      <main
        className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FAF3E0" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#F4A261] border-t-transparent" />
          <p className="text-lg font-bold" style={{ color: "#2D3E50" }}>
            Loading deals...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: "#FAF3E0" }}>
      {/* Header Section */}
      <div className="pt-32 pb-16 px-6 md:px-12 border-b-2" style={{ borderColor: "#E8DCC4" }}>
        <div className="container mx-auto">
          <div
            className="inline-block px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
          >
            <span className="text-sm font-bold">🔥 Today&apos;s Deals</span>
          </div>
          <h1
            className="text-5xl md:text-7xl font-black mb-4 tracking-tight"
            style={{ color: "#2D3E50" }}
          >
            Discounted Products
          </h1>
          <p
            className="text-xl max-w-2xl leading-relaxed"
            style={{ color: "#5A6C7D" }}
          >
            Hand‑picked variants where the current price is lower than the original list price.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search deals by name, category, color..."
              className="flex-1 px-4 py-3 rounded-lg border-2 text-base focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
              style={{
                borderColor: "#E8DCC4",
                color: "#2D3E50",
                backgroundColor: "#FFFFFF",
              }}
              aria-label="Search discounted products"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-bold text-sm tracking-wide uppercase whitespace-nowrap transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
            >
              Search
            </button>
          </div>
          {urlSearch && (
            <p className="mt-2 text-sm" style={{ color: "#5A6C7D" }}>
              {totalCount === 0
                ? `No deals found for "${urlSearch}". Try a different search.`
                : `${totalCount} deal${totalCount !== 1 ? "s" : ""} for "${urlSearch}"`}
            </p>
          )}
        </form>

        {/* Deals grid */}
        {error && (
          <div
            className="mb-6 p-4 rounded-xl border-2"
            style={{ borderColor: "#E8DCC4", backgroundColor: "#FFE5E5", color: "#C92A2A" }}
          >
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div
            className="py-16 text-center rounded-xl border-2"
            style={{ borderColor: "#E8DCC4", backgroundColor: "#FFFFFF" }}
          >
            <p className="text-lg font-medium mb-2" style={{ color: "#2D3E50" }}>
              No discounted products right now.
            </p>
            <p className="text-sm" style={{ color: "#5A6C7D" }}>
              Check back later or browse all products in the shop.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b-2" style={{ borderColor: '#E8DCC4' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#2D3E50' }}>
                Current Deals
              </h2>
              <span className="text-sm font-medium" style={{ color: '#5A6C7D' }}>
                Showing {totalCount === 0 ? 0 : (pageFromUrl - 1) * ITEMS_PER_PAGE + 1}–{Math.min(pageFromUrl * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {items.map((item) => {
                const href = `/shop/${encodeURIComponent(
                  item.categorySlug
                )}/${encodeURIComponent(item.subcategorySlug)}/${encodeURIComponent(item.slug)}?sku=${encodeURIComponent(item.sku)}`;

                const hasListPrice =
                  typeof item.listPrice === "number" && item.listPrice > item.price;
                const discountPercent = hasListPrice
                  ? Math.round(((item.listPrice! - item.price) / item.listPrice!) * 100)
                  : 0;

                return (
                  <Link key={item.id} href={href} className="group block">
                    <div
                      className="bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col"
                      style={{ borderColor: "#E8DCC4" }}
                    >
                      <div
                        className="relative aspect-square w-full overflow-hidden"
                        style={{ backgroundColor: "#F5ECD4" }}
                      >
                        {item.primaryImageUrl ? (
                          <Image
                            src={item.primaryImageUrl}
                            alt={item.groupName}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ color: "#8B9CAE" }}
                          >
                            <div className="text-center">
                              <div className="text-4xl mb-2">📦</div>
                              <span className="text-xs font-medium">No image</span>
                            </div>
                          </div>
                        )}

                        {/* Discount badge */}
                        {hasListPrice && (
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: '#E63946', color: '#FFFFFF' }}>
                            -{discountPercent}%
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3
                            className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#F4A261] transition-colors duration-300"
                            style={{ color: "#2D3E50" }}
                          >
                            {item.groupName}
                          </h3>
                          <div
                            className="flex items-center gap-2 text-xs mb-3"
                            style={{ color: "#8B9CAE" }}
                          >
                            <span className="font-medium">{item.mainCategory}</span>
                          </div>
                        </div>

                        {/* Price with discount */}
                        <div className="flex flex-col items-start gap-1">
                          {hasListPrice && (
                            <span
                              className="text-sm line-through"
                              style={{ color: "#8B9CAE" }}
                            >
                              ${item.listPrice!.toFixed(2)}
                            </span>
                          )}
                          <span
                            className="text-2xl font-black"
                            style={{ color: "#F4A261" }}
                          >
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <PaginationBar
              currentPage={pageFromUrl}
              totalPages={totalPages}
              basePath={pathname}
              searchParams={paginationSearchParams}
              totalCount={totalCount}
              pageSize={ITEMS_PER_PAGE}
            />
          </>
        )}
      </div>
    </main>
  );
}

