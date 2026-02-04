// components/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-base font-semibold tracking-wide transition-colors duration-200 hover:text-[#F4A261]"
                style={{ color: "#5A6C7D" }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="text-base font-bold tracking-wide"
                style={{ color: "#2D3E50" }}
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight 
                className="w-4 h-4 shrink-0" 
                style={{ color: "#8B9CAE" }}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}