"use client";

import { usePathname } from "next/navigation";
import { SkeletonHero, SkeletonProductGrid, SkeletonCategories, SkeletonSimplePage } from "@/components/Skeletons/SkeletonBlocks";
import CircularText from "@/components/CircularText";

export default function Loading() {
    const pathname = usePathname();

    if (pathname === "/") {
        return (
            <div className="min-h-screen" style={{ backgroundColor: "#FAF3E0" }}>
                <SkeletonHero />
                <SkeletonProductGrid />
                <SkeletonCategories />
            </div>
        );
    }

    if (pathname?.startsWith("/shop")) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: "#FAF3E0" }}>
                <SkeletonProductGrid />
            </div>
        );
    }

    // For pages in development - HomeBuddy themed loader
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center" style={{ backgroundColor: "#FAF3E0" }}>
            <div className="flex flex-col items-center gap-8">
                {/* Circular spinning text */}
                <CircularText 
                    text="HOMEBUDDY • LOADING • HOMEBUDDY • LOADING • "
                    spinDuration={8}
                    onHover="speedUp"
                    className="text-[#F4A261]"
                />
                
                {/* Center logo */}
                <div className="absolute">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
                        <span className="text-4xl">🏠</span>
                    </div>
                </div>

                {/* Loading text below */}
                <p className="text-lg font-bold mt-32" style={{ color: "#2D3E50" }}>
                    Making your home yours...
                </p>
            </div>
        </div>
    );
}