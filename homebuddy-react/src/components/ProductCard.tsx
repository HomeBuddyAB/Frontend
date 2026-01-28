// components/ProductCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GroupedProductCard } from '@/lib/shop-types';

export default function ProductCard({
  product,
  categorySlug,
}: {
  product: GroupedProductCard;
  categorySlug: string;
}) {
  const priceText =
    product.minPrice === product.maxPrice
      ? `$${product.minPrice.toFixed(2)}`
      : `From $${product.minPrice.toFixed(2)}`;

  // CRITICAL FIX: Use groupSlug (or fallback to groupId), NOT sampleSku!
  const productIdentifier = product.groupSlug || product.groupId;

  if (!productIdentifier) {
    console.warn('⚠️ Product missing both groupSlug and groupId:', product);
    return null;
  }

  // Build the correct URL: /shop/{category}/{GROUP_IDENTIFIER}?sku={variant}
  const href = `/shop/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
    productIdentifier
  )}${product.sampleSku ? `?sku=${encodeURIComponent(product.sampleSku)}` : ''}`;

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DCC4' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#F4A261';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(244, 162, 97, 0.1), 0 10px 10px -5px rgba(244, 162, 97, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E8DCC4';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: '#F5ECD4' }}>
        {product.primaryImageUrl ? (
          <Image
            src={product.primaryImageUrl}
            alt={product.groupName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full grid place-items-center" style={{ color: '#8B9CAE' }}>
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">No image</span>
            </div>
          </div>
        )}

        {/* Out of Stock Badge */}
        {!product.anyInStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 62, 80, 0.85)' }}>
            <div className="bg-white px-6 py-3 rounded-lg">
              <span className="text-xs font-bold tracking-wider" style={{ color: '#E63946' }}>
                OUT OF STOCK
              </span>
            </div>
          </div>
        )}

        {/* NEW Badge - Always show on products */}
        {product.anyInStock && (
          <span className="absolute top-3 right-3 text-xs px-3 py-1 font-bold tracking-wider rounded-full" style={{ backgroundColor: '#F4A261', color: '#FFFFFF' }}>
            NEW
          </span>
        )}

        {/* Quick View Hint on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <div className="text-center py-3 font-bold uppercase text-xs tracking-widest rounded-lg" style={{ backgroundColor: '#F4A261', color: '#FFFFFF' }}>
            View Details
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Product Name */}
        <h3 className="font-bold text-lg mb-2 line-clamp-2 uppercase tracking-wide group-hover:text-[#F4A261] transition-colors duration-300" style={{ color: '#2D3E50' }}>
          {product.groupName}
        </h3>

        {/* Price */}
        <div className="text-2xl font-black mb-3" style={{ color: '#F4A261' }}>
          {priceText}
        </div>

        {/* METADATA DISPLAY - Shows if available */}
        {(product.description || product.brand || product.material) && (
          <div className="text-xs space-y-1 mb-3 flex-1" style={{ color: '#5A6C7D' }}>
            {product.brand && (
              <div className="truncate">
                <span className="font-bold" style={{ color: '#2D3E50' }}>Brand:</span> {product.brand}
              </div>
            )}
            {product.material && (
              <div className="truncate">
                <span className="font-bold" style={{ color: '#2D3E50' }}>Material:</span> {product.material}
              </div>
            )}
            {product.description && (
              <div className="line-clamp-2">
                <span className="font-bold" style={{ color: '#2D3E50' }}>Description:</span> {product.description}
              </div>
            )}
          </div>
        )}

        {/* Variants Badge */}
        {product.totalVariants > 1 && (
          <div className="mt-auto pt-3 border-t-2" style={{ borderColor: '#E8DCC4' }}>
            <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#FFF8F3', color: '#F4A261' }}>
              <span>+{product.totalVariants} Options Available</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}