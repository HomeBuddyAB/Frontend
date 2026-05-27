// components/ProductCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import FavoriteHeart from '@/components/FavoriteHeart';
import SaleDiscountCorner from '@/components/SaleDiscountCorner';
import { GroupedProductCard } from '@/lib/shop-types';

export default function ProductCard({
  product,
  categorySlug,
  subcategorySlug,
  compact = false,
  /** Full-height image with title & price sliding up over the bottom on hover (hero spotlights). */
  detailsSlideUpOverlay = false,
}: {
  product: GroupedProductCard;
  categorySlug: string;
  subcategorySlug?: string;
  compact?: boolean;
  detailsSlideUpOverlay?: boolean;
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

  const resolvedSubcategory = subcategorySlug || categorySlug;
  const href = `/shop/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
    resolvedSubcategory
  )}/${encodeURIComponent(productIdentifier)}${product.sampleSku ? `?sku=${encodeURIComponent(product.sampleSku)}` : ''}`;

  const salePct =
    typeof product.maxDiscountPercent === 'number' && product.maxDiscountPercent > 0
      ? Math.round(product.maxDiscountPercent)
      : null;

  const rootRounded = compact ? 'rounded-md' : 'rounded-xl';
  const overlayShadow = compact
    ? '0 8px 16px -4px rgba(244, 162, 97, 0.15)'
    : detailsSlideUpOverlay
      ? '0 14px 30px -6px rgba(244, 162, 97, 0.12), 0 8px 12px -4px rgba(45, 62, 80, 0.08)'
      : '0 20px 25px -5px rgba(244, 162, 97, 0.1), 0 10px 10px -5px rgba(244, 162, 97, 0.04)';

  if (detailsSlideUpOverlay) {
    return (
      <div
        className={`group relative min-h-0 flex h-full flex-1 overflow-hidden border-2 transition-all duration-300 flex-col ${rootRounded}`}
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DCC4' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#F4A261';
          e.currentTarget.style.boxShadow = overlayShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E8DCC4';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden" style={{ backgroundColor: '#F5ECD4' }}>
          {salePct != null && <SaleDiscountCorner percent={salePct} />}
          {/* Favorites heart – above full-card link */}
          {product.sampleSku && (
            <div
              className={`pointer-events-auto absolute right-3 z-40 ${salePct != null ? 'top-14' : 'top-3'}`}
            >
              <FavoriteHeart sku={product.sampleSku} variant="compact" />
            </div>
          )}

          {/* Full-area hit target */}
          <Link
            href={href}
            className="absolute inset-0 z-10 outline-none ring-inset ring-[#F4A261]/0 transition-[box-shadow] focus-visible:z-[35] focus-visible:ring-2"
            aria-label={`${product.groupName}. ${priceText}. View details.`}
          />

          <div className="relative pointer-events-none h-full min-h-0 w-full flex-1 overflow-hidden">
            {product.primaryImageUrl ? (
              <Image
                src={product.primaryImageUrl}
                alt=""
                aria-hidden
                fill
                className="pointer-events-none object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                sizes="320px"
                priority={false}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center" style={{ color: '#8B9CAE' }}>
                <div className="text-center px-4">
                  <svg className="mx-auto mb-2 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">No image</span>
                </div>
              </div>
            )}

            {!product.anyInStock && (
              <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 62, 80, 0.85)' }}>
                <div className="rounded-lg bg-white px-6 py-3">
                  <span className="text-xs font-bold tracking-wider" style={{ color: '#E63946' }}>
                    OUT OF STOCK
                  </span>
                </div>
              </div>
            )}

            {product.anyInStock && (
              <span
                className="pointer-events-auto absolute left-3 top-3 z-[25] font-bold uppercase tracking-wider rounded-full px-3 py-1 text-xs"
                style={{ backgroundColor: '#F4A261', color: '#FFFFFF' }}
              >
                NEW
              </span>
            )}

            {/* Title & price slide up over the lower image area */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 translate-y-full transform-gpu transition-transform duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none group-hover:translate-y-0 group-focus-within:translate-y-0 [@media(hover:none)]:translate-y-0"
            >
              <div
                className="bg-gradient-to-t from-[rgba(45,62,80,0.94)] via-[rgba(45,62,80,0.72)] to-transparent px-4 pb-4 pt-12 sm:pt-14"
              >
                <p className="line-clamp-2 text-lg font-bold uppercase tracking-wide leading-tight" style={{ color: '#FFFFFF' }}>
                  {product.groupName}
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums" style={{ color: '#FFD166' }}>
                  {priceText}
                </p>
                {product.totalVariants > 1 && (
                  <p className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFD166' }}>
                    +{product.totalVariants} Options
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group overflow-hidden border-2 transition-all duration-300 h-full flex flex-col ${compact ? 'rounded-md hover:shadow-lg hover:-translate-y-0.5' : 'rounded-xl hover:shadow-2xl hover:-translate-y-2'}`}
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DCC4' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#F4A261';
        e.currentTarget.style.boxShadow = overlayShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E8DCC4';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: '#F5ECD4' }}>
        {salePct != null && <SaleDiscountCorner percent={salePct} />}
        {/* Favorites heart – uses sampleSku for this group card when available */}
        {product.sampleSku && (
          <div className={`absolute right-3 z-40 ${salePct != null ? (compact ? 'top-10' : 'top-14') : 'top-3'}`}>
            <FavoriteHeart sku={product.sampleSku} variant="compact" />
          </div>
        )}

        <Link href={href} className="block w-full h-full relative">
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

          {/* NEW Badge - avoid overlapping sale ribbon */}
          {product.anyInStock && (
            <span
              className={`absolute font-bold tracking-wider rounded-full ${
                salePct != null
                  ? compact
                    ? 'top-1 left-1 text-[10px] px-1.5 py-0.5'
                    : 'left-3 top-3 text-xs px-3 py-1'
                  : compact
                    ? 'top-1 right-1 text-[10px] px-1.5 py-0.5'
                    : 'top-3 right-3 text-xs px-3 py-1'
              }`}
              style={{ backgroundColor: '#F4A261', color: '#FFFFFF' }}
            >
              NEW
            </span>
          )}

          {/* Quick View Hint on Hover - hide in compact to keep height minimal */}
          {!compact && (
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <div className="text-center py-3 font-bold uppercase text-xs tracking-widest rounded-lg" style={{ backgroundColor: '#F4A261', color: '#FFFFFF' }}>
                View Details
              </div>
            </div>
          )}
        </Link>
      </div>

      <div className={`flex flex-col shrink-0 ${compact ? 'p-1.5' : 'p-4 flex-1'}`}>
        {/* Product Name */}
        <Link
          href={href}
          className={`font-bold line-clamp-1 uppercase tracking-wide group-hover:text-[#F4A261] transition-colors duration-300 ${compact ? 'text-xs mb-0.5' : 'text-lg mb-2 line-clamp-2'}`}
          style={{ color: '#2D3E50' }}
        >
          {product.groupName}
        </Link>

        {/* Price */}
        <div className={`font-black ${compact ? 'text-sm' : 'text-2xl mb-3'}`} style={{ color: '#F4A261' }}>
          {priceText}
        </div>

        {/* METADATA DISPLAY - hide in compact */}
        {!compact && (product.description || product.brand || product.material) && (
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
          <div className={`border-t-2 ${compact ? 'pt-1 mt-0.5' : 'mt-auto pt-3'}`} style={{ borderColor: '#E8DCC4' }}>
            <div className={`inline-flex items-center font-bold rounded-full ${compact ? 'text-[10px] px-1.5 py-0.5' : 'gap-2 text-xs px-3 py-1'}`} style={{ backgroundColor: '#FFF8F3', color: '#F4A261' }}>
              <span>+{product.totalVariants} {compact ? 'opts' : 'Options Available'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}