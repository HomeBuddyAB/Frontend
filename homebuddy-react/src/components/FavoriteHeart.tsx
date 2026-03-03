"use client";

import { useEffect, useState } from "react";
import { favoritesService } from "@/services/favorites.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

type FavoriteHeartProps = {
  sku: string;
  /**
   * Optional callback invoked after favorite state changes.
   * Useful for parents that want to remove items from a list when unfavorited.
   */
  onChange?: (isFavorite: boolean) => void;
  /**
   * Visual size variant.
   */
  variant?: "default" | "compact";
};

export default function FavoriteHeart({
  sku,
  onChange,
  variant = "default",
}: FavoriteHeartProps) {
  const { isAuthenticated, setShowLoginPopup } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sku || !isAuthenticated) {
      setIsFavorite(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const res = await favoritesService.checkBySku(sku);
      if (!cancelled && res.data) {
        setIsFavorite(res.data.isFavorite);
        onChange?.(res.data.isFavorite);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sku, isAuthenticated, onChange]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!sku) return;

    if (!isAuthenticated) {
      setShowLoginPopup(true, "login");
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        const res = await favoritesService.removeBySku(sku);
        if (res.error) {
          toast.error(res.error || "Failed to remove from favorites");
        } else {
          setIsFavorite(false);
          onChange?.(false);
        }
      } else {
        const res = await favoritesService.addBySku(sku);
        if (res.error) {
          toast.error(res.error || "Failed to add to favorites");
        } else {
          setIsFavorite(true);
          onChange?.(true);
        }
      }
    } catch {
      toast.error("Could not update favorites");
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses =
    "inline-flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  const sizeClasses =
    variant === "compact"
      ? "w-9 h-9 text-sm"
      : "w-10 h-10 text-base shadow-md hover:scale-110";

  const stateClasses = isFavorite
    ? "bg-red-500 border-red-500 text-white"
    : "bg-white/90 border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500";

  const iconSizeClasses =
    variant === "compact" ? "text-xl" : "text-2xl md:text-3xl";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={`${baseClasses} ${sizeClasses} ${stateClasses}`}
    >
      <span className={`leading-none ${iconSizeClasses}`}>♥</span>
    </button>
  );
}

