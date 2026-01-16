import Breadcrumbs from '@/components/Breadcrumbs';
import ListingFilters from '@/components/ListingFilters';
import { fetchCategories, fetchCategoryListing, groupVariantsToProducts } from '@/lib/api-client';
import Link from 'next/link';
import Image from 'next/image';

// NOTE: We assume the data types (VariantListItem and GroupedProductCard) 
// are correctly imported/defined elsewhere in your project (e.g., in shop-types.ts)

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const title = `${decodeURIComponent(params.category).toUpperCase()} • Shop`;
  return { title };
}

export default async function CategoryPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const categorySlug = decodeURIComponent(params.category);
  const [categories, rows] = await Promise.all([
    fetchCategories(),
    fetchCategoryListing({
      categorySlug,
      color: typeof searchParams.color === 'string' ? searchParams.color : undefined,
      size: typeof searchParams.size === 'string' ? searchParams.size : undefined,
      minPrice: typeof searchParams.min === 'string' ? searchParams.min : undefined,
      maxPrice: typeof searchParams.max === 'string' ? searchParams.max : undefined,
      sort: (typeof searchParams.sort === 'string' ? searchParams.sort : 'price-asc') as any,
      page: typeof searchParams.page === 'string' ? searchParams.page : undefined,
      pageSize: typeof searchParams.pageSize === 'string' ? searchParams.pageSize : '24',
    }),
  ]);

  const category = categories.find((c) => c.slug === categorySlug);
  // Use the grouping function to get display-ready product cards
  const groupedProducts = groupVariantsToProducts(rows);

  // Derive naive facets for the filter UI from rows
  const availableColors = Array.from(
    new Set(rows.map((r) => r.color).filter((x): x is string => !!x))
  ).sort((a, b) => a.localeCompare(b));

  const availableSizes = Array.from(
    new Set(rows.map((r) => r.size).filter((x): x is string => !!x))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: "#171010" }}>
      {/* Header Section */}
      <div className="pt-32 pb-8 px-4 md:px-8 border-b border-[#362222]">
        <div className="container mx-auto">
          <div className="mb-6 opacity-60">
            <Breadcrumbs
              items={[
                { label: "HOME", href: "/" },
                { label: "SHOP", href: "/shop" },
                {
                  label:
                    category?.name?.toUpperCase() || categorySlug.toUpperCase(),
                },
              ]}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
              {category?.name || categorySlug}
            </h1>
            <div className="font-mono text-gray-400 text-sm tracking-widest uppercase mb-2">
              {groupedProducts.length}{" "}
              {groupedProducts.length === 1 ? "Product" : "Products"} Found
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-12">
          {/* Sidebar Filters - Sticky for better UX */}
          <aside className="lg:top-24 h-fit z-10">
            <ListingFilters
              availableColors={availableColors}
              availableSizes={availableSizes}
            />
          </aside>

          {/* Product Grid */}
          <section>
            {groupedProducts.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-[#362222] rounded-lg">
                <p className="text-gray-400 text-xl font-light">
                  No products match your filters. Try clearing some options.
                </p>
                <a
                  href={`/shop/${categorySlug}`}
                  className="text-[#8B4513] hover:text-white mt-4 inline-block font-bold uppercase tracking-wider text-sm transition-colors"
                >
                  Clear all filters
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {groupedProducts.map((product) => {
                  // Use aggregated fields from the GroupedProductCard
                  const href = `/shop/${encodeURIComponent(
                    categorySlug
                  )}/${encodeURIComponent(
                    product.groupSlug ?? ""
                  )}?sku=${encodeURIComponent(product.sampleSku ?? "")}`;

                  // Display logic for price range
                  const priceDisplay =
                    product.minPrice === product.maxPrice
                      ? `$${product.minPrice}`
                      : `$${product.minPrice} - $${product.maxPrice}`;

                  return (
                    <Link
                      key={product.groupId}
                      href={href}
                      className="group block"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-4/5 w-full overflow-hidden bg-[#201a1a] mb-4">
                        {product.primaryImageUrl ? (
                          <Image
                            src={product.primaryImageUrl}
                            alt={product.groupName}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#362222]">
                            <span className="font-mono text-xs">NO IMAGE</span>
                          </div>
                        )}

                        {/* Badges */}
                        {!product.anyInStock && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white font-bold tracking-widest border border-white px-4 py-2">
                              SOLD OUT
                            </span>
                          </div>
                        )}

                        {/* Hover Action */}
                        <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 transition-colors duration-300 pointer-events-none">
                          <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-auto">
                            <div className="bg-white text-black text-center py-3 font-extrabold uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-gray-200 transition-colors">
                              View Details
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-white font-extrabold uppercase tracking-wide text-lg group-hover:text-[#8B4513] transition-colors duration-300 line-clamp-1">
                            {product.groupName}
                          </h3>
                          <span className="text-gray-300 font-bold text-base ml-4">
                            {priceDisplay}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono uppercase">
                          <span>
                            {product.totalVariants} Variant
                            {product.totalVariants !== 1 && "s"}
                          </span>
                          {product.totalVariants > 1 && (
                            <>
                              <span>/</span>
                              <span className="text-[#64421d]">
                                Multiple Options
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}