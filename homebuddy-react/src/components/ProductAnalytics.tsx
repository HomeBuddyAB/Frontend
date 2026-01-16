"use client";

import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";

interface ProductAnalyticsProps {
  product: {
    sku: string;
    name: string;
    price: number;
    category?: string;
  };
}

export default function ProductAnalytics({ product }: ProductAnalyticsProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      analytics.viewProduct({
        id: product.sku,
        name: product.name,
        price: product.price,
        category: product.category,
      });
      hasTracked.current = true;
    }
  }, [product]);

  return null;
}
