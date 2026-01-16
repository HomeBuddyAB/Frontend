'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GalleryImage {
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Set initial image (primary or first image)
  useEffect(() => {
    if (images && images.length > 0) {
      const primaryImage = images.find(img => img.isPrimary);
      setSelectedImage(primaryImage?.url || images[0].url);
    } else {
      setSelectedImage(null);
    }
  }, [images]);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full">
        <div style={{ backgroundColor: "rgb(43, 43, 43)" }} className="relative aspect-square w-full rounded-lg flex items-center justify-center">
          <Image
            src="/no-image-available.png"
            alt="No Image Available"
            fill
            className="invert object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          />
        </div>
      </div>
    );
  }

  // Sort images: primary first, then by sortOrder
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="w-full space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-square w-full bg-gray-900 rounded-lg overflow-hidden">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={productName}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* Thumbnail Gallery - Only show if multiple images */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((img, index) => (
            <button
              key={`${img.url}-${index}`}
              onClick={() => setSelectedImage(img.url)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${selectedImage === img.url
                ? 'border-white ring-2 ring-white/50'
                : 'border-gray-600 hover:border-gray-400'
                }`}
              aria-label={img.altText || `View image ${index + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
              {img.isPrimary && (
                <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                  Main
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {sortedImages.length > 1 && (
        <div className="text-center text-sm text-gray-400">
          {sortedImages.findIndex(img => img.url === selectedImage) + 1} / {sortedImages.length}
        </div>
      )}
    </div>
  );
}