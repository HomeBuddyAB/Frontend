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
    <aside className="bg-white border-2 rounded-xl overflow-hidden shadow-sm" style={{ borderColor: "#E8DCC4" }}>
      {/* Header - Entire area is clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 border-b-2 flex items-center justify-between cursor-pointer transition-all duration-200"
        style={{ borderColor: "#E8DCC4", backgroundColor: "#FFF8F3" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#FAF3E0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#FFF8F3";
        }}
        aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
      >
        <div className="flex justify-between w-full items-center gap-3">
          <h2 className="font-black text-lg uppercase tracking-wider" style={{ color: "#2D3E50" }}>
            Filters
          </h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent collapse when clicking clear
                  clearAllFilters();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 border-2"
                style={{ 
                  backgroundColor: "#FFFFFF",
                  color: "#F4A261",
                  borderColor: "#F4A261"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F4A261";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.color = "#F4A261";
                }}
              >
                Clear All
              </button>
            )}
            <div className="transition-all rounded-lg" style={{ color: "#5A6C7D" }}>
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>
      </button>

      {/* Collapsible Content - 800ms transition */}
      <div
        className={`transition-all duration-800 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Sort By - Moved to top */}
          <div>
            <label className="block text-xs font-black mb-3 uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
              Sort By
            </label>
            <select
              className="w-full border-2 rounded-lg px-4 py-3 text-sm font-semibold outline-none transition-all duration-200 cursor-pointer appearance-none"
              style={{ 
                backgroundColor: "#FFFFFF",
                borderColor: "#E8DCC4",
                color: "#2D3E50"
              }}
              value={current.sort}
              onChange={(e) => {
                updateParam("sort", e.target.value);
                analytics.applyFilter("sort", e.target.value);
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#F4A261";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E8DCC4";
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
            <label className="block text-xs font-black mb-3 uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
              Price Range
            </label>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <input
                type="number"
                className="flex-1 w-full border-2 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all duration-200"
                style={{ 
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E8DCC4",
                  color: "#2D3E50"
                }}
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#F4A261";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E8DCC4";
                  updateParam("min", localMin || null);
                  if (localMin) analytics.applyFilter("price_min", localMin);
                }}
                placeholder="Min $"
              />
              <span className="font-bold hidden md:inline" style={{ color: "#8B9CAE" }}>—</span>
              <input
                type="number"
                className="flex-1 w-full border-2 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all duration-200"
                style={{ 
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E8DCC4",
                  color: "#2D3E50"
                }}
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#F4A261";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E8DCC4";
                  updateParam("max", localMax || null);
                  if (localMax) analytics.applyFilter("price_max", localMax);
                }}
                placeholder="Max $"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2" style={{ borderColor: "#E8DCC4" }} />

          {/* Color Filter */}
          <div>
            <label className="block text-xs font-black mb-3 uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 border-2 ${
                  !current.color ? "shadow-lg" : ""
                }`}
                style={
                  !current.color
                    ? {
                        backgroundColor: "#F4A261",
                        color: "#FFFFFF",
                        borderColor: "#F4A261",
                      }
                    : {
                        backgroundColor: "#FFFFFF",
                        color: "#5A6C7D",
                        borderColor: "#E8DCC4",
                      }
                }
                onClick={() => updateParam("color", null)}
                onMouseEnter={(e) => {
                  if (current.color) {
                    e.currentTarget.style.borderColor = "#F4A261";
                    e.currentTarget.style.color = "#2D3E50";
                  }
                }}
                onMouseLeave={(e) => {
                  if (current.color) {
                    e.currentTarget.style.borderColor = "#E8DCC4";
                    e.currentTarget.style.color = "#5A6C7D";
                  }
                }}
              >
                All
              </button>
              {availableColors.map((c) => (
                <button
                  key={c}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 border-2 ${
                    current.color === c ? "shadow-lg" : ""
                  }`}
                  style={
                    current.color === c
                      ? {
                          backgroundColor: "#F4A261",
                          color: "#FFFFFF",
                          borderColor: "#F4A261",
                        }
                      : {
                          backgroundColor: "#FFFFFF",
                          color: "#5A6C7D",
                          borderColor: "#E8DCC4",
                        }
                  }
                  onClick={() => {
                    updateParam("color", c);
                    analytics.applyFilter("color", c);
                  }}
                  onMouseEnter={(e) => {
                    if (current.color !== c) {
                      e.currentTarget.style.borderColor = "#F4A261";
                      e.currentTarget.style.color = "#2D3E50";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (current.color !== c) {
                      e.currentTarget.style.borderColor = "#E8DCC4";
                      e.currentTarget.style.color = "#5A6C7D";
                    }
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-xs font-black mb-3 uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 border-2 ${
                  !current.size ? "shadow-lg" : ""
                }`}
                style={
                  !current.size
                    ? {
                        backgroundColor: "#F4A261",
                        color: "#FFFFFF",
                        borderColor: "#F4A261",
                      }
                    : {
                        backgroundColor: "#FFFFFF",
                        color: "#5A6C7D",
                        borderColor: "#E8DCC4",
                      }
                }
                onClick={() => updateParam("size", null)}
                onMouseEnter={(e) => {
                  if (current.size) {
                    e.currentTarget.style.borderColor = "#F4A261";
                    e.currentTarget.style.color = "#2D3E50";
                  }
                }}
                onMouseLeave={(e) => {
                  if (current.size) {
                    e.currentTarget.style.borderColor = "#E8DCC4";
                    e.currentTarget.style.color = "#5A6C7D";
                  }
                }}
              >
                All
              </button>
              {availableSizes.map((s) => (
                <button
                  key={s}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 border-2 ${
                    current.size === s ? "shadow-lg" : ""
                  }`}
                  style={
                    current.size === s
                      ? {
                          backgroundColor: "#F4A261",
                          color: "#FFFFFF",
                          borderColor: "#F4A261",
                        }
                      : {
                          backgroundColor: "#FFFFFF",
                          color: "#5A6C7D",
                          borderColor: "#E8DCC4",
                        }
                  }
                  onClick={() => {
                    updateParam("size", s);
                    analytics.applyFilter("size", s);
                  }}
                  onMouseEnter={(e) => {
                    if (current.size !== s) {
                      e.currentTarget.style.borderColor = "#F4A261";
                      e.currentTarget.style.color = "#2D3E50";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (current.size !== s) {
                      e.currentTarget.style.borderColor = "#E8DCC4";
                      e.currentTarget.style.color = "#5A6C7D";
                    }
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}