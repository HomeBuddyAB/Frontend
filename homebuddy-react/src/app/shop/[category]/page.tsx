import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchCategories, fetchSubcategories } from '@/lib/api-client';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

// NOTE: We assume the data types (VariantListItem and GroupedProductCard) 
// are correctly imported/defined elsewhere in your project (e.g., in shop-types.ts)

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const slug = decodeURIComponent(params.category);
  const titleCase = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return { title: `${titleCase} Subcategories • Shop` };
}

export default async function CategoryPage(props: Props) {
  const params = await props.params;
  const categorySlug = decodeURIComponent(params.category);
  const [allCategories, parentCategories] = await Promise.all([
    fetchCategories(),
    fetchCategories({ parentsOnly: true }),
  ]);

  const category = parentCategories.find((c) => c.slug === categorySlug);
  if (!category) {
    const leafMatch = allCategories.find((c) => c.slug === categorySlug && !!c.parentCategorySlug);
    if (leafMatch?.parentCategorySlug) {
      permanentRedirect(`/shop/${encodeURIComponent(leafMatch.parentCategorySlug)}/${encodeURIComponent(leafMatch.slug)}`);
    }
    notFound();
  }

  const subcategories = await fetchSubcategories(categorySlug);

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: "#FAF3E0" }}>
      <div className="pt-28 pb-8 px-4 md:px-8 border-b-2" style={{ borderColor: "#E8DCC4" }}>
        <div className="container mx-auto">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                {
                  label: category?.name || categorySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
                },
              ]}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: "#FFD166", color: "#2D3E50" }}>
                <span className="text-sm font-bold">🛠️ Category Overview</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.85]" style={{ color: "#2D3E50" }}>
                {category?.name || categorySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
              </h1>
            </div>
            <div className="text-sm font-bold tracking-wide uppercase px-4 py-2 rounded-lg" style={{ backgroundColor: "#FFFFFF", color: "#5A6C7D", border: "2px solid #E8DCC4" }}>
              {subcategories.length} Subcategor{subcategories.length === 1 ? "y" : "ies"}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        {subcategories.length === 0 ? (
          <div className="py-16 text-center rounded-xl border-2" style={{ borderColor: "#E8DCC4", backgroundColor: "#FFFFFF" }}>
            <p className="text-lg font-medium mb-2" style={{ color: "#2D3E50" }}>
              No subcategories available.
            </p>
            <p className="text-sm" style={{ color: "#5A6C7D" }}>
              Add subcategories from the admin panel to organize this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/shop/${encodeURIComponent(categorySlug)}/${encodeURIComponent(sub.slug)}`}
                className="block rounded-xl border-2 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: "#E8DCC4" }}
              >
                <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "#F4A261" }}>
                  Subcategory
                </div>
                <h2 className="text-2xl font-black mb-2" style={{ color: "#2D3E50" }}>
                  {sub.name}
                </h2>
                <p className="text-sm" style={{ color: "#5A6C7D" }}>
                  {sub.productGroupCount ?? 0} object{(sub.productGroupCount ?? 0) === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}