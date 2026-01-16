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
  // Fixed mapping function - add this to your ProductPage component

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
      className="min-h-screen text-white pb-24" // Added pb-24
      style={{ backgroundColor: "#171010" }}
    >
      <ProductAnalytics
        product={{
          sku: sku || group.variants[0].sku,
          name: group.name,
          price: group.variants[0].price,
          category: cat?.name || undefined,
        }}
      />

      {/* Matches Landing Page Header Spacing */}
      <div className="pt-32 pb-8 px-6 md:px-12 border-b border-[#362222]">
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
        <div className="mt-8">
          <VariantSelector
            group={mapGroupDetailToVariantSelector(group)}
            initialSku={sku}
          />
        </div>

        <div className="mt-8 border-t border-[#362222] pt-8">
          <CreateReviewSection groupSlug={group.groupSlug} />
        </div>

        <div className="mt-8">
          <ProductReviews groupSlug={group.groupSlug} />
        </div>

        <div className="ai-popup ">
          <OpenAiPopup groupSlug={group.groupSlug} />
        </div>
      </div>
    </div>
  );
}


// Inside ProductPage.tsx ...

