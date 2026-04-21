import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { favoritesService, FavoriteItem } from "@/services/favorites.service";
import FavoriteHeart from "@/components/FavoriteHeart";

const FavoritesSection = () => {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await favoritesService.getFavorites();
        if (res.error) {
          setError(res.error);
          setItems([]);
        } else if (res.data) {
          setItems(res.data.items ?? []);
        } else {
          setItems([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load favorites");
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleFavoriteChange = (sku: string, isFavorite: boolean) => {
    if (!isFavorite) {
      setItems((prev) => prev.filter((x) => x.sku !== sku));
    }
  };

  return (
    <section className="p-4 md:p-10 bg-[#171010] border border-[#423F3E]">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">
            Wishlist
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-1">
            All products you&apos;ve favorited. Tap the heart to remove items.
          </p>
        </div>
        <Link
          href="/favorites"
          className="text-xs md:text-sm font-bold tracking-widest uppercase px-4 py-2 border border-[#423F3E] text-gray-200 hover:bg-white hover:text-black transition-colors"
        >
          View Full List
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-[#423F3E] border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Failed to load favorites. Please try again later.
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          You haven&apos;t favorited any items yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((item) => {
            const href = item.slug
              ? `/shop/${encodeURIComponent(item.categorySlug)}/${encodeURIComponent(
                  item.subcategorySlug
                )}/${encodeURIComponent(item.slug)}?sku=${encodeURIComponent(item.sku)}`
              : item.groupLink;

            return (
              <Link
                key={item.id}
                href={href}
                className="group flex flex-col bg-[#0f0a0a] border border-[#423F3E] hover:border-[#8B4513] transition-colors"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#201a1a]">
                  {item.primaryImageUrl ? (
                    <Image
                      src={item.primaryImageUrl}
                      alt={item.groupName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#362222] text-xs">
                      NO IMAGE
                    </div>
                  )}

                  <div
                    className="absolute top-3 right-3"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <FavoriteHeart
                      sku={item.sku}
                      variant="compact"
                      onChange={(fav) => handleFavoriteChange(item.sku, fav)}
                    />
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-sm md:text-base font-bold text-white line-clamp-2 group-hover:text-[#F4A261] transition-colors">
                    {item.groupName}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {item.color} • {item.size}
                    </span>
                    <span className="font-mono text-[#F4A261]">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FavoritesSection;

