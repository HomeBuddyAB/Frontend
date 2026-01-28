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
    <main className="min-h-screen pb-24" style={{ backgroundColor: "#FAF3E0" }}>
      {/* Prettier, Narrower Header Section */}
      <div className="pt-28 pb-8 px-4 md:px-8 border-b-2" style={{ borderColor: "#E8DCC4" }}>
        <div className="container mx-auto">
          <div className="mb-4">
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

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: "#FFD166", color: "#2D3E50" }}>
                <span className="text-sm font-bold">🛠️ Category</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.85]" style={{ color: "#2D3E50" }}>
                {category?.name || categorySlug}
              </h1>
            </div>
            <div className="text-sm font-bold tracking-wide uppercase px-4 py-2 rounded-lg" style={{ backgroundColor: "#FFFFFF", color: "#5A6C7D", border: "2px solid #E8DCC4" }}>
              {groupedProducts.length}{" "}
              {groupedProducts.length === 1 ? "Product" : "Products"}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-12">
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
              <div className="py-20 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: "#E8DCC4", backgroundColor: "#FFFFFF" }}>
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-bold mb-2" style={{ color: "#2D3E50" }}>
                  No products found
                </p>
                <p className="text-lg mb-6" style={{ color: "#5A6C7D" }}>
                  Try adjusting your filters to see more results
                </p>
                <a
                  href={`/shop/${categorySlug}`}
                  className="inline-block px-8 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-300 rounded-lg hover:shadow-lg hover:-translate-y-1"
                  style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
                >
                  Clear all filters
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      {/* Card Container */}
                      <div className="bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col" style={{ borderColor: "#E8DCC4" }}>
                        {/* Image Container */}
                        <div className="relative aspect-square w-full overflow-hidden" style={{ backgroundColor: "#F5ECD4" }}>
                          {product.primaryImageUrl ? (
                            <Image
                              src={product.primaryImageUrl}
                              alt={product.groupName}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: "#8B9CAE" }}>
                              <div className="text-center">
                                <div className="text-4xl mb-2">📦</div>
                                <span className="text-xs font-medium">No image</span>
                              </div>
                            </div>
                          )}

                          {/* Out of Stock Badge */}
                          {!product.anyInStock && (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(45, 62, 80, 0.85)" }}>
                              <div className="bg-white px-6 py-3 rounded-lg">
                                <span className="font-bold tracking-wider text-sm" style={{ color: "#E63946" }}>
                                  OUT OF STOCK
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Multiple Variants Badge */}
                          {product.totalVariants > 1 && (
                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-xs" style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}>
                              +{product.totalVariants} Options
                            </div>
                          )}

                          {/* Hover Action */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                            <div className="text-center py-3 font-bold uppercase text-xs tracking-widest rounded-lg" style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}>
                              View Details
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#F4A261] transition-colors duration-300" style={{ color: "#2D3E50" }}>
                              {product.groupName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "#8B9CAE" }}>
                              <span className="uppercase font-medium">
                                {product.totalVariants} Variant{product.totalVariants !== 1 && "s"}
                              </span>
                              {product.totalVariants > 1 && (
                                <>
                                  <span>•</span>
                                  <span className="font-bold" style={{ color: "#F4A261" }}>
                                    Multiple Options
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-2xl font-black" style={{ color: "#F4A261" }}>
                            {priceDisplay}
                          </div>
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