// HomePage.tsx - Product-store focused homepage layout
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SplitText from "./SplitText";
import AnimatedContent from "./AnimatedContent";
import ProductCard from "./ProductCard";
import { fetchCategories, fetchCategoryListing, fetchDealsListing, groupVariantsToProducts } from "@/lib/api-client";
import type { VariantListItem } from "@/lib/api-client";
import type { GroupedProductCard } from "@/lib/shop-types";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, CornerDownRight } from "lucide-react";

type MixedProductItem = {
  product: GroupedProductCard;
  categorySlug: string;
  subcategorySlug: string;
};

type SubcategoryTile = {
  id: string;
  name: string;
  slug: string;
  parentSlug: string;
  parentName?: string;
  imageUrl?: string;
};

type DailyRecommendation = {
  product: GroupedProductCard;
  categorySlug: string;
  subcategorySlug: string;
};

function seededShuffle<T>(items: T[], seed: string): T[] {
  const out = [...items];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  for (let i = out.length - 1; i > 0; i -= 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const j = hash % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function getDailyRecommendedProduct(items: MixedProductItem[]): DailyRecommendation | null {
  const inStock = items.filter((i) => i.product.anyInStock);
  const pool = inStock.length > 0 ? inStock : items;
  if (pool.length === 0) return null;

  const today = new Date();
  const seed = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const index = hash % pool.length;
  return {
    product: pool[index].product,
    categorySlug: pool[index].categorySlug,
    subcategorySlug: pool[index].subcategorySlug,
  };
}

const PRODUCTS_PER_SUBCATEGORY = 8;
const MIXED_ROW_LIMIT = 36;
const DEALS_ROW_LIMIT = 24;

/** Homepage product grids: 4 columns, max 16 cells; slot 6 (index 5) is "See all products". */
const HOME_PRODUCT_GRID_COLS = 4;
const HOME_PRODUCT_GRID_MAX_SLOTS = 16;
const HOME_PRODUCT_GRID_CTA_INDEX = 5;
const HOME_PRODUCT_GRID_MAX_PRODUCTS = 15;

type HomeProductGridSlot =
  | { kind: "product"; item: MixedProductItem; slot: number }
  | { kind: "cta"; slot: number }
  | { kind: "empty"; slot: number };

function buildHomeProductGridSlots(items: MixedProductItem[]): HomeProductGridSlot[] {
  const products = items.slice(0, HOME_PRODUCT_GRID_MAX_PRODUCTS);
  const slots: HomeProductGridSlot[] = [];
  let pi = 0;
  for (let slot = 0; slot < HOME_PRODUCT_GRID_MAX_SLOTS; slot += 1) {
    if (slot === HOME_PRODUCT_GRID_CTA_INDEX) {
      slots.push({ kind: "cta", slot });
      continue;
    }
    if (pi < products.length) {
      slots.push({ kind: "product", item: products[pi], slot });
      pi += 1;
    } else {
      slots.push({ kind: "empty", slot });
    }
  }
  return slots;
}

function SeeAllProductsCard({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-full min-h-[140px] w-full flex-col items-center justify-center rounded-md border-2 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ backgroundColor: "#FFF8F3", borderColor: "#F4A261", color: "#2D3E50" }}
    >
      <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#F4A261" }}>
        {label}
      </span>
      <ArrowRight className="mt-2 h-5 w-5 shrink-0" style={{ color: "#2D3E50" }} aria-hidden />
    </Link>
  );
}

function HomeProductCardGrid({
  items,
  ctaHref = "/shop",
  ctaLabel = "See all products",
}: {
  items: MixedProductItem[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const slots = buildHomeProductGridSlots(items);
  return (
    <div
      className="grid w-full gap-2 sm:gap-3 justify-items-stretch"
      style={{ gridTemplateColumns: `repeat(${HOME_PRODUCT_GRID_COLS}, minmax(0, 1fr))` }}
    >
      {slots.map((cell) => {
        if (cell.kind === "cta") {
          return (
            <div key="home-grid-cta" className="min-w-0 h-full flex">
              <SeeAllProductsCard href={ctaHref} label={ctaLabel} />
            </div>
          );
        }
        if (cell.kind === "empty") {
          return <div key={`home-grid-empty-${cell.slot}`} className="min-w-0" aria-hidden />;
        }
        const { item } = cell;
        const stableKey = String(item.product.groupSlug || item.product.groupId || cell.slot);
        return (
          <div key={`${stableKey}-${cell.slot}`} className="min-w-0 h-full">
            <ProductCard
              product={item.product}
              categorySlug={item.categorySlug}
              subcategorySlug={item.subcategorySlug}
              compact
            />
          </div>
        );
      })}
    </div>
  );
}

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

function PromoBanner({
  href,
  imageSrc,
  imageAlt,
  dropdownText,
}: {
  href: string;
  imageSrc: string;
  imageAlt: string;
  dropdownText: string;
}) {
  return (
    <Link
      href={href}
      className="group block w-full cursor-pointer rounded-2xl"
      aria-label={dropdownText}
    >
      <div className="overflow-hidden rounded-2xl border-2 shadow-md transition-all duration-300 group-hover:shadow-xl" style={{ borderColor: "#E8DCC4" }}>
        <div className="overflow-hidden">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-auto object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>
        <div
          className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:max-h-16 group-hover:opacity-100"
          style={{ backgroundColor: "#F4A261" }}
        >
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white text-center">
            {dropdownText}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const subcategoriesSectionId = "homepage-subcategories-panel";
  const [subcategoriesOpen, setSubcategoriesOpen] = useState(false);
  const [mixedProducts, setMixedProducts] = useState<MixedProductItem[]>([]);
  const [subcategoryTiles, setSubcategoryTiles] = useState<SubcategoryTile[]>([]);
  const [saleProducts, setSaleProducts] = useState<MixedProductItem[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [dailyRecommendation, setDailyRecommendation] = useState<DailyRecommendation | null>(null);

  useEffect(() => {
    const load = async () => {
      setSectionsLoading(true);
      try {
        const cats = await fetchCategories({ leafOnly: true }).catch(() => []);
        const apiLeafList = Array.isArray(cats) && cats.length > 0
          ? cats
              .filter((c: any) => !!c.parentCategorySlug)
              .map((c: any) => ({
                id: String(c.id),
                name: c.name,
                slug: c.slug,
                parentCategorySlug: c.parentCategorySlug as string,
                parentCategoryName: c.parentCategoryName as string,
                productGroupCount: Number(c.productGroupCount || 0),
              }))
          : [];

        const list = [...apiLeafList]
          .sort((a, b) =>
            (b.productGroupCount || 0) - (a.productGroupCount || 0) ||
            a.name.localeCompare(b.name)
          );

        const today = new Date();
        const dailySeed = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;

        const subcategoryResults = await Promise.all(
          list.map(async (cat) => {
            try {
              const result = await fetchCategoryListing({
                parentCategorySlug: cat.parentCategorySlug,
                subcategorySlug: cat.slug,
                pageSize: String(PRODUCTS_PER_SUBCATEGORY),
                page: "1",
              });
              const products = groupVariantsToProducts(result.items ?? []);
              return { cat, products };
            } catch {
              return { cat, products: [] as GroupedProductCard[] };
            }
          })
        );

        const tiles: SubcategoryTile[] = subcategoryResults.map(({ cat, products }) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          parentSlug: cat.parentCategorySlug,
          parentName: cat.parentCategoryName,
          imageUrl: products[0]?.primaryImageUrl || undefined,
        }));

        const mixedPool: MixedProductItem[] = [];
        subcategoryResults.forEach(({ cat, products }) => {
          products.forEach((product) => {
            mixedPool.push({
              product,
              categorySlug: cat.parentCategorySlug,
              subcategorySlug: cat.slug,
            });
          });
        });

        const dedupedMixed = Array.from(
          new Map(
            mixedPool.map((item) => [item.product.groupSlug || item.product.groupId || item.product.groupName, item])
          ).values()
        );

        const dealsResult = await fetchDealsListing({
          page: "1",
          pageSize: String(DEALS_ROW_LIMIT),
        }).catch(() => ({ items: [] as VariantListItem[], totalCount: 0, page: 1, pageSize: DEALS_ROW_LIMIT, totalPages: 0 }));
        const groupedDeals = groupVariantsToProducts(dealsResult.items ?? []);

        // Keep deal links route-safe by deriving slugs from the underlying deal rows.
        const dealLookup = new Map(
          (dealsResult.items ?? []).map((i) => [
            i.slug || i.groupSlug || i.objectId || i.groupName,
            i,
          ])
        );
        const normalizedSales: MixedProductItem[] = groupedDeals
          .map((product) => {
            const key = product.groupSlug || product.groupId || product.groupName;
            const raw = dealLookup.get(String(key));
            return {
              product,
              categorySlug: raw?.categorySlug || "",
              subcategorySlug: raw?.subcategorySlug || raw?.categorySlug || "",
            };
          })
          .filter((i) => i.categorySlug && i.subcategorySlug);

        const saleKeys = new Set(
          normalizedSales.map((i) =>
            String(i.product.groupSlug || i.product.groupId || i.product.groupName || "")
          ).filter(Boolean)
        );

        const exploreOnly = dedupedMixed.filter((item) => {
          const k = String(item.product.groupSlug || item.product.groupId || item.product.groupName || "");
          if (saleKeys.has(k)) return false;
          const pct = item.product.maxDiscountPercent;
          if (typeof pct === "number" && pct > 0) return false;
          return true;
        });
        const shuffledMixed = seededShuffle(exploreOnly, `home-mixed-${dailySeed}`).slice(0, MIXED_ROW_LIMIT);

        setSubcategoryTiles(tiles);
        setMixedProducts(shuffledMixed);
        setSaleProducts(normalizedSales);
      } catch (e) {
        console.error("HomePage load error:", e);
        setSubcategoryTiles([]);
        setMixedProducts([]);
        setSaleProducts([]);
      } finally {
        setSectionsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!sectionsLoading && mixedProducts.length > 0) {
      setDailyRecommendation(getDailyRecommendedProduct(mixedProducts));
      return;
    }
    setDailyRecommendation(null);
  }, [sectionsLoading, mixedProducts]);

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
                    <ProductCard
                      product={dailyRecommendation.product}
                      categorySlug={dailyRecommendation.categorySlug}
                      subcategorySlug={dailyRecommendation.subcategorySlug}
                      detailsSlideUpOverlay
                    />
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

      {/* Section A: Subcategory quick navigation (collapsed by default) */}
      <section className="px-6 py-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: "#E8DCC4", backgroundColor: "#FAF3E0" }}>
            <button
              type="button"
              id="homepage-subcategories-toggle"
              aria-expanded={subcategoriesOpen}
              aria-controls={subcategoriesSectionId}
              onClick={() => setSubcategoriesOpen((open) => !open)}
              className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-5 sm:py-4 text-left transition-colors hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 bg-white shadow-sm"
                style={{ borderColor: "#E8DCC4", color: "#F4A261" }}
                aria-hidden
              >
                <LayoutGrid className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg sm:text-xl md:text-2xl font-black leading-tight" style={{ color: "#2D3E50" }}>
                  Subcategories
                </span>
                <span
                  className={`mt-0.5 block text-xs sm:text-sm transition-opacity duration-300 ${subcategoriesOpen ? "opacity-100" : "opacity-75 line-clamp-1 sm:line-clamp-none"}`}
                  style={{ color: "#5A6C7D" }}
                >
                  Jump straight into a subcategory.
                </span>
              </span>
              <CornerDownRight
                className="hidden md:block shrink-0 h-6 w-6 -rotate-12 opacity-80"
                style={{ color: "#F4A261" }}
                strokeWidth={2}
                aria-hidden
              />
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-transform duration-300 ease-out" style={{ borderColor: "#E8DCC4", color: "#2D3E50" }}>
                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ease-out ${subcategoriesOpen ? "-rotate-180" : ""}`} aria-hidden />
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${subcategoriesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              id={subcategoriesSectionId}
              role="region"
              aria-labelledby="homepage-subcategories-toggle"
            >
              <div
                className="min-h-0 overflow-hidden border-t-2"
                style={{ borderColor: "#E8DCC4" }}
                {...(!subcategoriesOpen ? { inert: true } : {})}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 sm:p-5 bg-white">
                  {subcategoryTiles.map((tile) => (
                    <Link
                      key={tile.id}
                      href={`/shop/${encodeURIComponent(tile.parentSlug)}/${encodeURIComponent(tile.slug)}`}
                      className="rounded-xl border-2 p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                      style={{ borderColor: "#E8DCC4", backgroundColor: "#FAF3E0" }}
                    >
                      <div className="h-16 w-full grid place-items-center mb-2">
                        {tile.imageUrl ? (
                          <img src={tile.imageUrl} alt={tile.name} className="h-14 w-14 object-cover rounded-lg" loading="lazy" />
                        ) : (
                          <div className="h-14 w-14 rounded-lg grid place-items-center" style={{ backgroundColor: "#F5ECD4", color: "#8B9CAE" }}>
                            <span className="text-xl">📦</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-center font-semibold leading-tight" style={{ color: "#2D3E50" }}>
                        {tile.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section B: Mixed product discovery row */}
      <section
        className="px-6 pt-4 pb-6 box-border"
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E8DCC4",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <AnimatedContent delay={0.1} distance={24}>
            <div className="shrink-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-0.5" style={{ color: "#2D3E50" }}>
                Explore Products
              </h2>
              <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: "#5A6C7D" }}>
                A mixed row of products from active subcategories.
              </p>
            </div>
          </AnimatedContent>

          {sectionsLoading ? (
            <div
              className="grid w-full gap-2 sm:gap-3 justify-items-stretch"
              style={{ gridTemplateColumns: `repeat(${HOME_PRODUCT_GRID_COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: HOME_PRODUCT_GRID_MAX_SLOTS }, (_, slot) =>
                slot === HOME_PRODUCT_GRID_CTA_INDEX ? (
                  <div
                    key={`explore-sk-cta-${slot}`}
                    className="min-w-0 rounded-md border-2 animate-pulse"
                    style={{ borderColor: "#F4D4A8", backgroundColor: "#FFF8F3", minHeight: 140 }}
                  />
                ) : (
                  <div
                    key={`explore-sk-${slot}`}
                    className="min-w-0 rounded-md border-2 overflow-hidden animate-pulse"
                    style={{ borderColor: "#E8DCC4", backgroundColor: "#F5ECD4" }}
                  >
                    <div className="aspect-square bg-white/50" />
                    <div className="p-2 space-y-1">
                      <div className="h-3 w-3/4 rounded" style={{ backgroundColor: "#E8DCC4" }} />
                      <div className="h-4 w-1/3 rounded" style={{ backgroundColor: "#E8DCC4" }} />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : mixedProducts.length === 0 ? (
            <div
              className="rounded-lg border-2 p-6 text-center w-full"
              style={{ borderColor: "#E8DCC4", backgroundColor: "#FAF3E0" }}
            >
              <p className="text-sm" style={{ color: "#5A6C7D" }}>
                No products available yet.
              </p>
            </div>
          ) : (
            <HomeProductCardGrid items={mixedProducts} />
          )}
        </div>
      </section>

      {/* Catalogue banner (links to shop) below Explore Products */}
      <section className="px-6 py-6" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-7xl mx-auto">
          <PromoBanner
            href="/shop"
            imageSrc="/Top_Banner.png"
            imageAlt="Top banner linking to full catalogue"
            dropdownText="View full catalogue"
          />
        </div>
      </section>

      {/* Section C: On-sale products row (between catalogue banner and sales image banner) */}
      <section className="px-6 pt-2 pb-10" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: "#2D3E50" }}>
              On Sale
            </h2>
            <Link href="/deals" className="inline-flex items-center gap-1 font-bold text-xs tracking-wider uppercase" style={{ color: "#F4A261" }}>
              View all deals
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {saleProducts.length === 0 ? (
            <div
              className="rounded-lg border-2 p-6 text-center w-full"
              style={{ borderColor: "#E8DCC4", backgroundColor: "#FAF3E0" }}
            >
              <p className="text-sm" style={{ color: "#5A6C7D" }}>
                No discounted products right now.
              </p>
            </div>
          ) : (
            <HomeProductCardGrid items={saleProducts} ctaHref="/deals" ctaLabel="See all on sale" />
          )}
        </div>
      </section>

      {/* Sales image banner */}
      <section className="px-6 py-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto">
          <PromoBanner
            href="/deals"
            imageSrc="/Sales_Banner.png"
            imageAlt="Sales banner linking to deals"
            dropdownText="View items on sale"
          />
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
