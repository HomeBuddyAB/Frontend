// HomePage.tsx - Product-store focused homepage with side-scrollable category rows
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SplitText from "./SplitText";
import AnimatedContent from "./AnimatedContent";
import ProductCard from "./ProductCard";
import { fetchCategories, fetchCategoryListing, groupVariantsToProducts } from "@/lib/api-client";
import type { GroupedProductCard } from "@/lib/shop-types";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const DEMO_CATEGORY_SLUGS = [
  { id: "1", name: "Furniture", slug: "furniture" },
  { id: "2", name: "Materials", slug: "materials" },
  { id: "3", name: "Power Tools", slug: "power-tools" },
  { id: "4", name: "Lighting", slug: "lighting" },
];

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  products: GroupedProductCard[];
};

type DailyRecommendation = {
  product: GroupedProductCard;
  categorySlug: string;
};

function getDailyRecommendedProduct(rows: CategoryRow[]): DailyRecommendation | null {
  const inStock: DailyRecommendation[] = [];
  const all: DailyRecommendation[] = [];

  for (const row of rows) {
    for (const product of row.products) {
      const item = { product, categorySlug: row.slug };
      all.push(item);
      if (product.anyInStock) {
        inStock.push(item);
      }
    }
  }

  const pool = inStock.length > 0 ? inStock : all;
  if (pool.length === 0) return null;

  const today = new Date();
  const seed = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const index = hash % pool.length;
  return pool[index];
}

const PRODUCTS_PER_ROW = 12;

const TESTIMONIALS = [
  { stars: 5, quote: "Best home improvement store in the area! Staff is incredibly knowledgeable.", name: "Sarah M.", loc: "San Francisco, CA" },
  { stars: 5, quote: "Quality products at fair prices. My go-to supplier for 20 years.", name: "Mike T.", loc: "Oakland, CA" },
  { stars: 5, quote: "First-time DIYer—the team walked me through everything. Project turned out amazing!", name: "Jessica L.", loc: "Berkeley, CA" },
];

const TRUSTED_BRANDS = ["DeWalt", "Makita", "Milwaukee", "Bosch", "Ryobi", "Black+Decker"];

function CustomerRatingBlock() {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const t = TESTIMONIALS[current];
  return (
    <div className="h-full rounded-2xl border-2 p-6 flex flex-col overflow-hidden" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8DCC4" }}>
      <h2 className="text-xl md:text-2xl font-black mb-4 shrink-0" style={{ color: "#2D3E50" }}>
        What Customers Say
      </h2>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex gap-1 mb-3">
          {Array.from({ length: t.stars }).map((_, j) => (
            <span key={j} className="text-lg" style={{ color: "#FFD166" }}>★</span>
          ))}
        </div>
        <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "#5A6C7D" }}>&quot;{t.quote}&quot;</p>
        <p className="font-bold text-sm" style={{ color: "#2D3E50" }}>{t.name}</p>
        <p className="text-xs mb-4" style={{ color: "#8B9CAE" }}>{t.loc}</p>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={prev} aria-label="Previous testimonial" className="p-2 rounded-lg border-2 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#F4A261]" style={{ borderColor: "#E8DCC4" }}>
            <ChevronLeft className="w-5 h-5" style={{ color: "#2D3E50" }} />
          </button>
          <div className="flex gap-1.5">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} type="button" aria-label={`Go to testimonial ${i + 1}`} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "scale-125" : ""}`} style={{ backgroundColor: i === current ? "#F4A261" : "#E8DCC4" }} />
            ))}
          </div>
          <button type="button" onClick={next} aria-label="Next testimonial" className="p-2 rounded-lg border-2 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#F4A261]" style={{ borderColor: "#E8DCC4" }}>
            <ChevronRight className="w-5 h-5" style={{ color: "#2D3E50" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TrustedBrandsBlock() {
  return (
    <div className="h-full rounded-2xl border-2 p-6 flex flex-col overflow-hidden" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8DCC4" }}>
      <h2 className="text-xl md:text-2xl font-black mb-4 shrink-0" style={{ color: "#2D3E50" }}>
        Trusted Brands
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 content-start">
        {TRUSTED_BRANDS.map((brand) => (
          <div key={brand} className="rounded-xl p-4 border-2 flex items-center justify-center min-h-[72px] transition-all hover:shadow-md hover:scale-[1.02]" style={{ borderColor: "#E8DCC4", backgroundColor: "#FFF8F3", color: "#5A6C7D" }}>
            <span className="font-bold text-sm text-center">{brand}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [dailyRecommendation, setDailyRecommendation] = useState<DailyRecommendation | null>(null);

  useEffect(() => {
    const load = async () => {
      setRowsLoading(true);
      try {
        const cats = await fetchCategories().catch(() => []);
        // Use API categories when available, but always show all 4 homepage rows (merge with demo so Power Tools etc. are never missing)
        const apiList = Array.isArray(cats) && cats.length > 0
          ? cats.map((c) => ({ id: String(c.id), name: c.name, slug: c.slug }))
          : [];
        const slugToCat = new Map(apiList.map((c) => [c.slug, c]));
        const list = DEMO_CATEGORY_SLUGS.map((demo) => slugToCat.get(demo.slug) ?? demo);

        const rows: CategoryRow[] = await Promise.all(
          list.map(async (cat) => {
            try {
              const result = await fetchCategoryListing({
                categorySlug: cat.slug,
                pageSize: String(PRODUCTS_PER_ROW),
                page: "1",
              });
              const products = groupVariantsToProducts(result.items ?? []);
              return { id: cat.id, name: cat.name, slug: cat.slug, products };
            } catch {
              return { id: cat.id, name: cat.name, slug: cat.slug, products: [] };
            }
          })
        );
        setCategoryRows(rows);
      } catch (e) {
        console.error("HomePage load error:", e);
        setCategoryRows([]);
      } finally {
        setRowsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!rowsLoading && categoryRows.length > 0) {
      setDailyRecommendation(getDailyRecommendedProduct(categoryRows));
    }
  }, [rowsLoading, categoryRows]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) router.push(`/shop?search=${encodeURIComponent(q)}`);
    else router.push("/shop");
  };

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#FAF3E0" }}>
      {/* HomeBuddy top banner */}
      <section className="w-full pt-10 pb-4 flex items-center justify-center">
        <h1 className="homebuddy-page-banner">HomeBuddy</h1>
      </section>

      {/* Compact Hero - Storefront feel */}
      <section
        className="relative px-6 pt-12 pb-12 md:pt-20 md:pb-16 overflow-hidden"
        style={{
          backgroundImage: "url('/HomeBuddy-HEADER.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute top-10 right-0 w-48 h-48 rounded-full opacity-30 blur-3xl" style={{ background: "linear-gradient(135deg, #F4A261 0%, #E76F51 100%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: "linear-gradient(135deg, #6A994E 0%, #4A90E2 100%)" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <AnimatedContent delay={0.1} distance={24}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5" style={{ backgroundColor: "#FFD166", color: "#2D3E50" }}>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold">Your Home Improvement Store</span>
                </div>
              </AnimatedContent>
              <SplitText
                text="SHOP TOOLS & MORE"
                className="text-5xl md:text-6xl font-black mb-4 leading-tight tracking-tight text-[#2D3E50]"
                delay={40}
                duration={0.5}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 30 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-50px"
                textAlign="left"
              />
              <AnimatedContent delay={0.25} distance={20}>
                <p className="text-lg md:text-xl mb-6" style={{ color: "#5A6C7D" }}>
                  Quality tools, materials, and supplies for every project. Browse categories and find what you need.
                </p>
              </AnimatedContent>
              <AnimatedContent delay={0.35} distance={20}>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg mb-6">
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 px-4 py-3 rounded-lg border-2 text-[#2D3E50] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                    style={{ borderColor: "#E8DCC4", backgroundColor: "#FFFFFF" }}
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg font-bold text-sm tracking-wide uppercase whitespace-nowrap transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
                  >
                    Search
                  </button>
                </form>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-8 py-4 font-bold text-sm tracking-widest uppercase transition-all hover:scale-105 hover:shadow-xl rounded-lg"
                    style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
                  >
                    Shop All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-8 py-4 font-bold text-sm tracking-widest uppercase border-2 transition-all hover:scale-105 rounded-lg"
                    style={{ borderColor: "#F4A261", color: "#2D3E50", backgroundColor: "transparent" }}
                  >
                    About Us
                  </Link>
                </div>
              </AnimatedContent>
            </div>
            <AnimatedContent delay={0.2} distance={40} direction="horizontal" reverse>
              <div
                className="hidden lg:flex w-full lg:w-80 xl:w-96 aspect-square rounded-2xl border-2 shadow-2xl bg-white/70 backdrop-blur-sm flex-col p-4"
                style={{ borderColor: "#E8DCC4" }}
              >
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-center mb-2" style={{ color: "#5A6C7D" }}>
                  Recommended product of the day
                </div>
                <div className="flex-1 min-h-0">
                  {dailyRecommendation ? (
                    <ProductCard product={dailyRecommendation.product} categorySlug={dailyRecommendation.categorySlug} />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs" style={{ color: "#8B9CAE" }}>
                      Loading today&apos;s pick...
                    </div>
                  )}
                </div>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Category rows: all 4 rows visible, no height cap. Each row clips its own content so no bleed. */}
      <section
        className="px-6 pt-4 pb-6 box-border"
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E8DCC4",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col">
          <AnimatedContent delay={0.1} distance={24}>
            <div className="shrink-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-0.5" style={{ color: "#2D3E50" }}>
                Shop by Category
              </h2>
              <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: "#5A6C7D" }}>Browse products in each category</p>
            </div>
          </AnimatedContent>

          {rowsLoading ? (
            <div className="max-w-7xl w-full mx-auto grid gap-2 sm:gap-3" style={{ gridTemplateRows: 'repeat(4, auto)' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-h-0 flex flex-col">
                  <div className="h-5 sm:h-6 w-32 sm:w-40 rounded animate-pulse mb-1 shrink-0" style={{ backgroundColor: "#E8DCC4" }} />
                  <div className="flex gap-2 sm:gap-3 overflow-hidden flex-1 min-h-0">
                    {                    [1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex-shrink-0 w-[96px] sm:w-[108px] md:w-[120px] lg:w-[132px] xl:w-[144px] rounded-lg border-2 overflow-hidden animate-pulse" style={{ borderColor: "#E8DCC4", backgroundColor: "#F5ECD4" }}>
                        <div className="aspect-square bg-white/50" />
                        <div className="p-2 space-y-1">
                          <div className="h-3 w-3/4 rounded" style={{ backgroundColor: "#E8DCC4" }} />
                          <div className="h-4 w-1/3 rounded" style={{ backgroundColor: "#E8DCC4" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:gap-3" style={{ gridTemplateRows: 'repeat(4, auto)' }}>
              {categoryRows.map((row, rowIndex) => (
                <div key={row.id} className="min-h-0 flex flex-col overflow-hidden">
                  <AnimatedContent delay={rowIndex * 0.05} distance={24}>
                    <div className="max-w-7xl w-full mx-auto flex-1 min-h-0 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between gap-1 mb-1 shrink-0 min-h-[1.5rem]">
                      <h3 className="text-sm sm:text-base md:text-lg font-black truncate" style={{ color: "#2D3E50" }}>
                        {row.name}
                      </h3>
                      <Link
                        href={`/shop/${encodeURIComponent(row.slug)}`}
                        className="inline-flex items-center gap-1 font-bold text-xs tracking-wider uppercase transition-colors hover:gap-1.5 shrink-0"
                        style={{ color: "#F4A261" }}
                      >
                        View all
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div
                      className="flex gap-2 sm:gap-3 overflow-x-auto overflow-y-hidden pb-1 scroll-smooth scrollbar-thin min-h-0 flex-1 max-h-full"
                      style={{
                        scrollbarWidth: "thin",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      {row.products.length === 0 ? (
                        <div className="min-w-[96px] rounded-lg border-2 p-2 text-center shrink-0" style={{ borderColor: "#E8DCC4", backgroundColor: "#FAF3E0" }}>
                          <p className="text-xs" style={{ color: "#5A6C7D" }}>No products yet.</p>
                          <Link href={`/shop/${encodeURIComponent(row.slug)}`} className="mt-1 inline-block font-bold text-xs" style={{ color: "#F4A261" }}>
                            View category →
                          </Link>
                        </div>
                      ) : (
                        row.products.map((product, cardIndex) => (
                          <div
                            key={product.groupSlug || product.groupId || cardIndex}
                            className="flex-shrink-0 w-[96px] sm:w-[108px] md:w-[120px] lg:w-[132px] xl:w-[144px]"
                          >
                            <ProductCard product={product} categorySlug={row.slug} compact />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  </AnimatedContent>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer ratings + Trusted brands: two side-by-side interactive containers */}
      <section className="py-14 px-6" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left container: What Customers Say - interactive carousel */}
          <CustomerRatingBlock />
          {/* Right container: Trusted Brands - interactive brand buttons */}
          <TrustedBrandsBlock />
        </div>
      </section>
      <style jsx>{`
        .homebuddy-page-banner {
          font-family: "Segoe Script", "Comic Sans MS", "Bradley Hand", cursive, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: clamp(3rem, 8vw, 5rem);
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: none;
          color: #2d3e50;
          text-align: center;
          opacity: 0;
          animation: homebuddy-page-fade 4.5s ease-in-out forwards;
        }

        @keyframes homebuddy-page-fade {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
