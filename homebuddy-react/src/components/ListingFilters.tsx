"use client";

import { analytics } from "@/lib/analytics";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ListingFilters({
  availableColors,
  availableSizes,
}: {
  availableColors: string[];
  availableSizes: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [localMin, setLocalMin] = useState(sp.get("min") || "");
  const [localMax, setLocalMax] = useState(sp.get("max") || "");
  const [isExpanded, setIsExpanded] = useState(true);

  const updateParam = useCallback(
    (key: string, value?: string | null) => {
      const next = new URLSearchParams(sp.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      router.replace(`${pathname}?${next.toString()}`);
    },
    [router, pathname, sp]
  );

  const current = useMemo(
    () => ({
      color: sp.get("color") || "",
      size: sp.get("size") || "",
      sort: sp.get("sort") || "price-asc",
      min: sp.get("min") || "",
      max: sp.get("max") || "",
      pageSize: sp.get("pageSize") || "24",
    }),
    [sp]
  );

  const hasActiveFilters =
    current.color || current.size || current.min || current.max;

  const clearAllFilters = () => {
    setLocalMin("");
    setLocalMax("");
    const next = new URLSearchParams();
    next.set("sort", current.sort);
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <aside className="bg-[#1a1515] border border-[#362222] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#362222] flex items-center justify-between">
        <div className="flex justify-between w-full items-center gap-3">
          <h2 className="text-white font-black text-lg uppercase tracking-wider">
            Filters
          </h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 bg-[#2B2B2B] text-[#8B4513] hover:bg-[#8B4513] hover:text-white border border-[#362222] hover:border-[#8B4513] rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-300 hover:text-white transition-all"
              aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Sort By - Moved to top */}
          <div>
            <label className="block text-xs font-black mb-3 text-gray-400 uppercase tracking-widest">
              Sort By
            </label>
            <select
              className="w-full border rounded-lg px-4 py-3 text-white text-sm font-medium outline-none transition-all duration-200 cursor-pointer appearance-none bg-[#2B2B2B] border-[#362222] hover:border-[#423F3E] focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20"
              value={current.sort}
              onChange={(e) => {
                updateParam("sort", e.target.value);
                analytics.applyFilter("sort", e.target.value);
              }}
            >
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-black mb-3 text-gray-400 uppercase tracking-widest">
              Price Range
            </label>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <input
                type="number"
                className="flex-1 w-full border rounded-lg px-3 py-2.5 text-white text-sm font-medium outline-none transition-all duration-200 bg-[#2B2B2B] border-[#362222] hover:border-[#423F3E] focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                onBlur={() => {
                  updateParam("min", localMin || null);
                  if (localMin) analytics.applyFilter("price_min", localMin);
                }}
                placeholder="Min"
              />
              <span className="text-gray-600 hidden md:inline font-bold">—</span>
              <input
                type="number"
                className="flex-1 w-full border rounded-lg px-3 py-2.5 text-white text-sm font-medium outline-none transition-all duration-200 bg-[#2B2B2B] border-[#362222] hover:border-[#423F3E] focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                onBlur={() => {
                  updateParam("max", localMax || null);
                  if (localMax) analytics.applyFilter("price_max", localMax);
                }}
                placeholder="Max"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#362222]" />

          {/* Color and Size - Inline 50/50 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Color Filter */}
            <div>
              <label className="block text-xs font-black mb-3 text-gray-400 uppercase tracking-widest">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                    !current.color
                      ? "bg-[#8B4513] text-white shadow-lg shadow-[#8B4513]/20"
                      : "bg-[#2B2B2B] text-gray-400 border border-[#362222] hover:border-[#423F3E] hover:text-white"
                  }`}
                  onClick={() => updateParam("color", null)}
                >
                  All
                </button>
                {availableColors.map((c) => (
                  <button
                    key={c}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                      current.color === c
                        ? "bg-[#8B4513] text-white shadow-lg shadow-[#8B4513]/20"
                        : "bg-[#2B2B2B] text-gray-400 border border-[#362222] hover:border-[#423F3E] hover:text-white"
                    }`}
                    onClick={() => {
                      updateParam("color", c);
                      analytics.applyFilter("color", c);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-xs font-black mb-3 text-gray-400 uppercase tracking-widest">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                    !current.size
                      ? "bg-[#8B4513] text-white shadow-lg shadow-[#8B4513]/20"
                      : "bg-[#2B2B2B] text-gray-400 border border-[#362222] hover:border-[#423F3E] hover:text-white"
                  }`}
                  onClick={() => updateParam("size", null)}
                >
                  All
                </button>
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                      current.size === s
                        ? "bg-[#8B4513] text-white shadow-lg shadow-[#8B4513]/20"
                        : "bg-[#2B2B2B] text-gray-400 border border-[#362222] hover:border-[#423F3E] hover:text-white"
                    }`}
                    onClick={() => {
                      updateParam("size", s);
                      analytics.applyFilter("size", s);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
