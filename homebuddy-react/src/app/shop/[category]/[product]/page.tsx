import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import VariantSelector from "@/components/VariantSelector";
import ProductAnalytics from "@/components/ProductAnalytics";
import {
  fetchCategories,
  fetchGroupDetail,
  GroupDetail,
} from "@/lib/api-client";
import OpenAiPopup from "./openAiPopup";
import ProductReviews from "./productReviews";
import { useAuth } from "@/contexts/AuthContext";
import CreateReviewSection from "./CreateReviewSection";

type Props = {
  params: Promise<{ category: string; product: string }>;
  searchParams?: Promise<{ sku?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const title = `${decodeURIComponent(
    resolvedParams.product
  )} • ${decodeURIComponent(resolvedParams.category)} • Shop`;
  return { title };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.category;
  const productSlug = resolvedParams.product;
  const sku = resolvedSearchParams?.sku;

  let group;
  try {
    group = await fetchGroupDetail(productSlug, sku);
  } catch (err) {
    notFound();
  }

  // Mapping function
  function mapGroupDetailToVariantSelector(groupDetail: GroupDetail) {
    return {
      name: groupDetail.name,
      groupSlug: groupDetail.groupSlug || "",
      variants: groupDetail.variants.map((v) => ({
        sku: v.sku,
        color: v.color ?? "",
        size: v.size ?? "",
        price: v.price,
        inStock: v.inStock,
        images: v.images, // Already strings from api-client
        description: v.description,
        brand: v.brand,
        material: v.material,
      })),
      facets: {
        colors: groupDetail.facets.colors.map((c) => c.value),
        sizes: groupDetail.facets.sizes.map((s) => s.value),
      },
    };
  }

  const categories = await fetchCategories();
  const cat = categories.find((c) => c.slug === categorySlug);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: "#FAF3E0" }}
    >
      <ProductAnalytics
        product={{
          sku: sku || group.variants[0].sku,
          name: group.name,
          price: group.variants[0].price,
          category: cat?.name || undefined,
        }}
      />

      {/* Prettier, Narrower Header with Breadcrumbs */}
      <div className="pt-28 pb-6 px-6 md:px-12 border-b-2" style={{ borderColor: "#E8DCC4" }}>
        <div className="container mx-auto">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: cat?.name || categorySlug, href: `/shop/${categorySlug}` },
              { label: group.name },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">
        {/* Product Details Section */}
        <div className="mt-8 bg-white rounded-2xl p-8 border-2 shadow-lg" style={{ borderColor: "#E8DCC4" }}>
          <VariantSelector
            group={mapGroupDetailToVariantSelector(group)}
            initialSku={sku}
          />
        </div>

        {/* Create Review Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 border-2" style={{ borderColor: "#E8DCC4" }}>
          <div className="mb-6">
            <h2 className="text-3xl font-black mb-2" style={{ color: "#2D3E50" }}>
              Share Your Experience
            </h2>
            <p className="text-lg" style={{ color: "#5A6C7D" }}>
              Help other homeowners by leaving a review
            </p>
          </div>
          <CreateReviewSection groupSlug={group.groupSlug} />
        </div>

        {/* Product Reviews Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 border-2" style={{ borderColor: "#E8DCC4" }}>
          <div className="mb-6">
            <h2 className="text-3xl font-black mb-2" style={{ color: "#2D3E50" }}>
              Customer Reviews
            </h2>
            <p className="text-lg" style={{ color: "#5A6C7D" }}>
              See what other customers are saying
            </p>
          </div>
          <ProductReviews groupSlug={group.groupSlug} />
        </div>

        {/* AI Assistant Popup */}
        <div className="ai-popup">
          <OpenAiPopup groupSlug={group.groupSlug} />
        </div>
      </div>
    </div>
  );
}