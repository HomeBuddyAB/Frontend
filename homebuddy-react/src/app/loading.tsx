"use client";

import { usePathname } from "next/navigation";
import { SkeletonHero, SkeletonProductGrid, SkeletonCategories, SkeletonSimplePage } from "@/components/Skeletons/SkeletonBlocks";

export default function Loading() {
    const pathname = usePathname();

    if (pathname === "/") {
        return (
            <div className="min-h-screen" style={{ backgroundColor: "#171010" }}>
                <SkeletonHero />
                <SkeletonProductGrid />
                <SkeletonCategories />
            </div>
        );
    }

    if (pathname?.startsWith("/shop")) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: "#171010" }}>
                <SkeletonProductGrid />
            </div>
        );
    }

    // For pages in development
    return <SkeletonSimplePage />;
}