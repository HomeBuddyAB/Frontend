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
      className="group block overflow-hidden border transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1"
      style={{ backgroundColor: '#2B2B2B', borderColor: '#362222' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#423F3E';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#362222';
      }}
    >
      <div className="aspect-square relative" style={{ backgroundColor: '#171010' }}>
        {product.primaryImageUrl ? (
          <Image
            src={product.primaryImageUrl}
            alt={product.groupName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-500">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {!product.anyInStock && (
          <span className="absolute top-2 left-2 text-xs px-3 py-1 font-bold tracking-wider text-white" style={{ backgroundColor: '#362222' }}>
            SOLD OUT
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="font-bold text-white line-clamp-2 uppercase tracking-wide mb-2">{product.groupName}</div>
        <div className="text-lg font-bold text-white mb-2">{priceText}</div>

        {/* METADATA DISPLAY - Shows if available */}
        {(product.description || product.brand || product.material) && (
          <div className="text-xs text-gray-400 space-y-1 mb-2">
            {product.brand && (
              <div className="truncate">
                <span className="font-bold text-gray-300">Brand:</span> {product.brand}
              </div>
            )}
            {product.material && (
              <div className="truncate">
                <span className="font-bold text-gray-300">Material:</span> {product.material}
              </div>
            )}
            {product.description && (
              <div className="line-clamp-2">
                <span className="font-bold text-gray-300">Desc:</span> {product.description}
              </div>
            )}
          </div>
        )}

        {product.totalVariants > 1 && (
          <div className="text-xs text-gray-400 font-medium">{product.totalVariants} OPTIONS AVAILABLE</div>
        )}
      </div>
    </Link>
  );
}