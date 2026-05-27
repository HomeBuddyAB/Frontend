import Breadcrumbs from '@/components/Breadcrumbs';
import ListingFilters from '@/components/ListingFilters';
import SaleDiscountCorner from '@/components/SaleDiscountCorner';
import PaginationBar from '@/components/PaginationBar';
import { fetchCategories, fetchCategoryListing, fetchGroupDetail, fetchSubcategories, groupVariantsToProducts } from '@/lib/api-client';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, permanentRedirect } from 'next/navigation';

type Props = {
  params: Promise<{ category: string; product: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const categoryTitle = decodeURIComponent(params.category);
  const subcategoryTitle = decodeURIComponent(params.product);
  return { title: `${subcategoryTitle} • ${categoryTitle} • Shop` };
}

export default async function SubcategoryPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const categorySlug = decodeURIComponent(params.category);
  const subcategorySlug = decodeURIComponent(params.product);
  const pageParam = typeof searchParams.page === 'string' ? searchParams.page : '1';
  const sku = typeof searchParams.sku === 'string' ? searchParams.sku : undefined;

  const [parentCategories, subcategories, listing] = await Promise.all([
    fetchCategories({ parentsOnly: true }),
    fetchSubcategories(categorySlug),
    fetchCategoryListing({
      parentCategorySlug: categorySlug,
      subcategorySlug,
      color: typeof searchParams.color === 'string' ? searchParams.color : undefined,
      size: typeof searchParams.size === 'string' ? searchParams.size : undefined,
      minPrice: typeof searchParams.min === 'string' ? searchParams.min : undefined,
      maxPrice: typeof searchParams.max === 'string' ? searchParams.max : undefined,
      sort: (typeof searchParams.sort === 'string' ? searchParams.sort : 'price-asc') as any,
      page: pageParam,
      pageSize: typeof searchParams.pageSize === 'string' ? searchParams.pageSize : '24',
    }),
  ]);

  const category = parentCategories.find((c) => c.slug === categorySlug);
  const subcategory = subcategories.find((c) => c.slug === subcategorySlug);
  if (!category || !subcategory) {
    // Backwards compatibility: old URLs used /shop/{category}/{objectSlug}
    // If this segment resolves to a group slug, redirect to canonical 3-level URL.
    const maybeGroup = await fetchGroupDetail(subcategorySlug, sku).catch(() => null);
    if (maybeGroup) {
      permanentRedirect(
        `/shop/${encodeURIComponent(maybeGroup.mainCategorySlug)}/${encodeURIComponent(maybeGroup.subcategorySlug)}/${encodeURIComponent(subcategorySlug)}${sku ? `?sku=${encodeURIComponent(sku)}` : ''}`
      );
    }
    notFound();
  }

  const rows = listing.items;
  const groupedProducts = groupVariantsToProducts(rows);
  const availableColors = Array.from(new Set(rows.map((r) => r.color).filter((x): x is string => !!x))).sort((a, b) => a.localeCompare(b));
  const availableSizes = Array.from(new Set(rows.map((r) => r.size).filter((x): x is string => !!x))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const paginationSearchParams: Record<string, string> = {};
  if (typeof searchParams.color === 'string') paginationSearchParams.color = searchParams.color;
  if (typeof searchParams.size === 'string') paginationSearchParams.size = searchParams.size;
  if (typeof searchParams.min === 'string') paginationSearchParams.min = searchParams.min;
  if (typeof searchParams.max === 'string') paginationSearchParams.max = searchParams.max;
  if (typeof searchParams.sort === 'string') paginationSearchParams.sort = searchParams.sort;
  paginationSearchParams.page = pageParam;
  paginationSearchParams.pageSize = String(listing.pageSize);

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: '#FAF3E0' }}>
      <div className="pt-28 pb-8 px-4 md:px-8 border-b-2" style={{ borderColor: '#E8DCC4' }}>
        <div className="container mx-auto">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Shop', href: '/shop' },
                { label: category.name, href: `/shop/${categorySlug}` },
                { label: subcategory.name },
              ]}
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#FFD166', color: '#2D3E50' }}>
                <span className="text-sm font-bold">🛠️ Subcategory</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.85]" style={{ color: '#2D3E50' }}>
                {subcategory.name}
              </h1>
            </div>
            <div className="text-sm font-bold tracking-wide uppercase px-4 py-2 rounded-lg" style={{ backgroundColor: '#FFFFFF', color: '#5A6C7D', border: '2px solid #E8DCC4' }}>
              {groupedProducts.length} Object{groupedProducts.length !== 1 ? 's' : ''}
              {listing.totalCount > 0 ? ` · ${listing.totalCount} Variant${listing.totalCount !== 1 ? 's' : ''}` : ''}
              {listing.totalPages > 1 ? ` · Page ${listing.page} of ${listing.totalPages}` : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-12">
          <aside className="lg:top-24 h-fit z-10">
            <ListingFilters availableColors={availableColors} availableSizes={availableSizes} />
          </aside>
          <section>
            {groupedProducts.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: '#E8DCC4', backgroundColor: '#FFFFFF' }}>
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-bold mb-2" style={{ color: '#2D3E50' }}>No products found</p>
                <p className="text-lg mb-6" style={{ color: '#5A6C7D' }}>Try adjusting your filters to see more results</p>
                <a
                  href={`/shop/${categorySlug}/${subcategorySlug}`}
                  className="inline-block px-8 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-300 rounded-lg hover:shadow-lg hover:-translate-y-1"
                  style={{ backgroundColor: '#F4A261', color: '#FFFFFF' }}
                >
                  Clear all filters
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {groupedProducts.map((product) => {
                  const href = `/shop/${encodeURIComponent(categorySlug)}/${encodeURIComponent(subcategorySlug)}/${encodeURIComponent(product.groupSlug ?? '')}?sku=${encodeURIComponent(product.sampleSku ?? '')}`;
                  const priceDisplay = product.minPrice === product.maxPrice ? `$${product.minPrice}` : `$${product.minPrice} - $${product.maxPrice}`;
                  return (
                    <Link key={product.groupId} href={href} className="group block">
                      <div className="bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col" style={{ borderColor: '#E8DCC4' }}>
                        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl" style={{ backgroundColor: '#F5ECD4' }}>
                          {product.maxDiscountPercent != null && product.maxDiscountPercent > 0 && (
                            <SaleDiscountCorner percent={product.maxDiscountPercent} />
                          )}
                          {product.primaryImageUrl ? (
                            <Image src={product.primaryImageUrl} alt={product.groupName} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: '#8B9CAE' }}>
                              <div className="text-center"><div className="text-4xl mb-2">📦</div><span className="text-xs font-medium">No image</span></div>
                            </div>
                          )}
                          {!product.anyInStock && (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 62, 80, 0.85)' }}>
                              <div className="bg-white px-6 py-3 rounded-lg"><span className="font-bold tracking-wider text-sm" style={{ color: '#E63946' }}>OUT OF STOCK</span></div>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#F4A261] transition-colors duration-300" style={{ color: '#2D3E50' }}>{product.groupName}</h3>
                          <div className="text-2xl font-black mt-auto" style={{ color: '#F4A261' }}>{priceDisplay}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <PaginationBar
              currentPage={listing.page}
              totalPages={listing.totalPages}
              basePath={`/shop/${encodeURIComponent(categorySlug)}/${encodeURIComponent(subcategorySlug)}`}
              searchParams={paginationSearchParams}
              totalCount={listing.totalCount}
              pageSize={listing.pageSize}
            />
          </section>
        </div>
      </div>
    </main>
  );
}