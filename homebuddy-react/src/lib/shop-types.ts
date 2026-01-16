// lib/shop-types.ts

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type VariantListItem = {
  sku: string;
  groupId?: string | null;
  groupSlug?: string | null;
  slug?: string | null;
  objectId?: string | null;
  groupName: string;
  price: number;
  inStock: boolean;
  color?: string | null;
  size?: string | null;
  primaryImageUrl?: string | null;
  moreVariantsCount?: number;
  // Metadata fields
  description?: string | null;
  brand?: string | null;
  material?: string | null;
};

export type SkuListItem = {
  sku: string;
  objectId: string;
  slug?: string;
  groupName: string;
  mainCategory: string;
  color: string;
  size: string;
  price: number;
  inStock: boolean;
  primaryImageUrl?: string;
  groupLink: string;
  moreVariantsCount: number;
  // Metadata fields
  description?: string | null;
  brand?: string | null;
  material?: string | null;
};

export type GroupedProductCard = {
  groupId: string;
  groupSlug?: string | null;
  groupName: string;
  primaryImageUrl?: string | null;
  minPrice: number;
  maxPrice: number;
  totalVariants: number;
  anyInStock: boolean;
  sampleSku?: string;
  description?: string | null;
  brand?: string | null;
  material?: string | null;
};

// ✅ NEW: Image type for gallery
export type VariantImage = {
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type GroupDetail = {
  groupId: string;
  groupSlug?: string | null;
  objectId?: string;
  slug?: string;
  name: string;
  mainCategory: string;
  heroImageUrl?: string | null;
  minPrice: number;
  maxPrice: number;
  inStockAny: boolean;
  variants: Array<{
    id?: string;
    sku: string;
    color?: string | null;
    size?: string | null;
    price: number;
    inStock: boolean;
    primaryImageUrl?: string | null;
    // Metadata fields
    description?: string | null;
    brand?: string | null;
    material?: string | null;
    // ✅ NEW: Images array for gallery
    images?: VariantImage[];
  }>;
  facets: {
    colors?: Array<{ value: string; count: number }>;
    sizes?: Array<{ value: string; count: number }>;
    priceFacet?: { globalMin: number; globalMax: number };
  };
  page?: number;
  pageSize?: number;
  totalVariants?: number;
  totalPages?: number;
};