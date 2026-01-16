"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-toastify"; // Ensure you have this installed

type Variant = {
  sku: string;
  color: string;
  size: string;
  price: number;
  inStock: boolean;
  images: string[];
  description: string | null;
  brand: string | null;
  material: string | null;
};

type GroupProps = {
  name: string;
  groupSlug: string;
  variants: Variant[];
  facets: {
    colors: string[];
    sizes: string[];
  };
};

export default function VariantSelector({
  group,
  initialSku,
}: {
  group: GroupProps;
  initialSku?: string;
}) {
  const { addItem } = useCart(); // Fixed typo: additem -> addItem
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant>(() => {
    return (
      group.variants.find((v) => v.sku === initialSku) || group.variants[0]
    );
  });

  const [activeImage, setActiveImage] = useState<string>(
    selectedVariant.images[0] || ""
  );

  // 1. Sync Active Image with Variant
  useEffect(() => {
    if (selectedVariant.images && selectedVariant.images.length > 0) {
      // Only switch image if current one isn't available in new variant
      if (!selectedVariant.images.includes(activeImage)) {
        setActiveImage(selectedVariant.images[0]);
      } else if (activeImage === "") {
        setActiveImage(selectedVariant.images[0]);
      }
    } else {
      setActiveImage("");
    }
  }, [selectedVariant, activeImage]);

  // 2. Handle Selection Logic (With Smart Fallback & Toasts)
  const handleVariantChange = (key: "color" | "size", value: string) => {
    const targetColor = key === "color" ? value : selectedVariant.color;
    const targetSize = key === "size" ? value : selectedVariant.size;

    // A. Try to find exact match
    const exactMatch = group.variants.find(
      (v) => v.color === targetColor && v.size === targetSize
    );

    // B. If no exact match, find the best available variant
    // (e.g., user switched color, but old size is OOS for new color)
    const bestMatch =
      exactMatch ||
      group.variants.find((v) =>
        key === "color" ? v.color === value : v.size === value
      );

    if (bestMatch) {
      // Notify user if we had to switch a property they didn't explicitly click
      if (!exactMatch) {
        if (key === "color") {
          toast.info(
            `Size ${targetSize} not available in ${value}. Switched to ${bestMatch.size}.`
          );
        } else {
          toast.info(
            `Color ${targetColor} not available in ${value}. Switched to ${bestMatch.color}.`
          );
        }
      }

      setSelectedVariant(bestMatch);

      // Update URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("sku", bestMatch.sku);
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }
  };

  // 3. Handle Add To Cart
  const handleAddToCart = () => {
    if (!selectedVariant || !selectedVariant.inStock) return;

    addItem({
      sku: selectedVariant.sku,
      name: group.name,
      color: selectedVariant.color || undefined,
      size: selectedVariant.size || undefined,
      price: selectedVariant.price,
      image: selectedVariant.images?.[0], // Fixed: Access flattened string array
      groupSlug: group.groupSlug,
    });

    // Show visual success feedback
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const availableColors = Array.from(new Set(group.variants.map((v) => v.color)));
  const availableSizes = Array.from(new Set(group.variants.map((v) => v.size)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 animate-in fade-in duration-700">

      {/* LEFT: Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[4/5] w-full bg-[#201a1a] overflow-hidden border border-[#362222]">
          {activeImage ? (
            <Image
              src={activeImage}
              alt={group.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#362222] font-mono uppercase">
              No Image
            </div>
          )}

          {!selectedVariant.inStock && (
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-white px-4 py-2 z-10">
              <span className="text-white text-xs font-bold tracking-widest uppercase">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {selectedVariant.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {selectedVariant.images.map((img, idx) => (
              <button
                key={`${selectedVariant.sku}-${idx}`}
                onClick={() => setActiveImage(img)}
                className={`relative flex-shrink-0 w-20 aspect-[4/5] border transition-all duration-300 ${activeImage === img
                    ? "border-[#8B4513] opacity-100 ring-1 ring-[#8B4513]"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-600"
                  }`}
              >
                <Image
                  src={img}
                  alt={`View ${idx}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Details */}
      <div className="flex flex-col justify-center">

        {/* Header */}
        <div className="mb-8 border-b border-[#362222] pb-8">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase leading-none">
            {group.name}
          </h1>

          <div className="flex items-center justify-between">
            <span className="text-3xl font-mono text-[#8B4513]">
              ${selectedVariant.price.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              SKU: {selectedVariant.sku}
            </span>
          </div>
        </div>

        {/* Selectors */}
        <div className="space-y-8 mb-12">
          {/* Color */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Color <span className="text-white ml-2">{selectedVariant.color}</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleVariantChange("color", color)}
                  className={`px-4 py-2 text-sm font-bold uppercase tracking-widest border transition-all duration-300 ${selectedVariant.color === color
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-gray-400 border-[#362222] hover:border-gray-400"
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Size <span className="text-white ml-2">{selectedVariant.size}</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {availableSizes.map((size) => {
                // Check availability relative to currently selected color
                const isAvailable = group.variants.some(
                  (v) =>
                    v.size === size &&
                    v.color === selectedVariant.color &&
                    v.inStock
                );

                return (
                  <button
                    key={size}
                    onClick={() => handleVariantChange("size", size)}
                    className={`h-12 flex items-center justify-center text-sm font-mono border transition-all duration-300 ${selectedVariant.size === size
                        ? "bg-[#8B4513] border-[#8B4513] text-white"
                        : isAvailable
                          ? "bg-transparent border-[#362222] text-gray-300 hover:border-white"
                          : "bg-[#201a1a] border-transparent text-gray-600 cursor-not-allowed decoration-slice line-through"
                      }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-12">
          {selectedVariant.description ? (
            <p className="text-gray-400 leading-relaxed text-sm">
              {selectedVariant.description}
            </p>
          ) : (
            <p className="text-gray-600 italic text-sm font-mono">
              No description available.
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          disabled={!selectedVariant.inStock || isSuccess}
          onClick={handleAddToCart}
          className={`w-full py-5 font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 ${isSuccess
              ? "bg-green-700 text-white cursor-default"
              : selectedVariant.inStock
                ? "bg-white text-black hover:bg-[#8B4513] hover:text-white"
                : "bg-[#362222] text-gray-500 cursor-not-allowed"
            }`}
        >
          {isSuccess
            ? "Added to Cart ✓"
            : selectedVariant.inStock
              ? "Add To Cart"
              : "Out of Stock"}
        </button>

        {/* Tech Specs */}
        {(selectedVariant.material || selectedVariant.brand) && (
          <div className="mt-8 pt-6 border-t border-[#362222] grid grid-cols-2 gap-4 text-xs font-mono text-gray-500 uppercase">
            {selectedVariant.material && (
              <div>
                <span className="block text-gray-700 mb-1">Material</span>
                <span className="text-gray-300">{selectedVariant.material}</span>
              </div>
            )}
            {selectedVariant.brand && (
              <div>
                <span className="block text-gray-700 mb-1">Brand</span>
                <span className="text-gray-300">{selectedVariant.brand}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}