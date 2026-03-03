"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { withAuth } from "@/contexts/AuthContext";
import { favoritesService, FavoriteItem } from "@/services/favorites.service";
import FavoriteHeart from "@/components/FavoriteHeart";

function FavoritesPageContent() {
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

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#F4A261] border-t-transparent" />
          <p className="text-lg font-bold" style={{ color: "#2D3E50" }}>
            Loading your favorites...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-md text-center bg-white rounded-xl p-6 border-2" style={{ borderColor: "#E8DCC4" }}>
          <h1 className="text-2xl font-black mb-3" style={{ color: "#2D3E50" }}>
            Could not load favorites
          </h1>
          <p className="text-sm mb-2" style={{ color: "#5A6C7D" }}>
            {error}
          </p>
          <p className="text-xs" style={{ color: "#8B9CAE" }}>
            Please try again in a moment.
          </p>
        </div>
      </main>
    );
  }

  const hasItems = items.length > 0;

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: "#FAF3E0" }}>
      {/* Header */}
      <div className="pt-32 pb-10 px-6 md:px-12 border-b-2" style={{ borderColor: "#E8DCC4" }}>
        <div className="container mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: "#FFD166", color: "#2D3E50" }}
          >
            <span className="text-sm font-bold">♥ Favorites</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-3 tracking-tight" style={{ color: "#2D3E50" }}>
            Your Wishlist
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "#5A6C7D" }}>
            All the products you&apos;ve favorited in one place. Tap the heart to remove items from your wishlist.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">
        {!hasItems ? (
          <div
            className="py-16 text-center rounded-xl border-2 bg-white"
            style={{ borderColor: "#E8DCC4" }}
          >
            <div className="text-5xl mb-4">♡</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#2D3E50" }}>
              No favorites yet
            </h2>
            <p className="text-sm mb-4" style={{ color: "#5A6C7D" }}>
              Browse the shop and tap the heart on any product you like to add it to your wishlist.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 rounded-full font-bold text-sm tracking-wide uppercase transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const categorySlug = item.mainCategory.toLowerCase().replace(/\s+/g, "-");
              const href = item.slug
                ? `/shop/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
                    item.slug
                  )}?sku=${encodeURIComponent(item.sku)}`
                : item.groupLink;

              return (
                <Link
                  key={item.id}
                  href={href}
                  className="group block bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col"
                  style={{ borderColor: "#E8DCC4" }}
                >
                  <div
                    className="relative aspect-square w-full overflow-hidden"
                    style={{ backgroundColor: "#F5ECD4" }}
                  >
                    {item.primaryImageUrl ? (
                      <Image
                        src={item.primaryImageUrl}
                        alt={item.groupName}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ color: "#8B9CAE" }}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">📦</div>
                          <span className="text-xs font-medium">No image</span>
                        </div>
                      </div>
                    )}

                    {/* Favorites heart */}
                    <div
                      className="absolute top-3 right-3 z-10"
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

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h2
                        className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#F4A261] transition-colors duration-300"
                        style={{ color: "#2D3E50" }}
                      >
                        {item.groupName}
                      </h2>
                      <div
                        className="flex items-center gap-2 text-xs mb-2"
                        style={{ color: "#8B9CAE" }}
                      >
                        <span className="font-medium">{item.mainCategory}</span>
                        <span>•</span>
                        <span>
                          {item.color} • {item.size}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className="text-xl font-black"
                        style={{ color: "#F4A261" }}
                      >
                        ${item.price.toFixed(2)}
                      </span>
                      {!item.inStock && (
                        <span
                          className="text-xs font-bold uppercase tracking-wide"
                          style={{ color: "#E63946" }}
                        >
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

const FavoritesPage = withAuth(FavoritesPageContent);

export default FavoritesPage;

