// components/LoadingBar.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import CircularText from "@/components/CircularText";

export default function LoadingBar() {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setLoading(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleComplete = () => setLoading(false);

        // Listen for link clicks
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (link && link.href && !link.href.startsWith("#") && !link.target) {
                const url = new URL(link.href);
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    handleStart();
                }
            }
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, [pathname]);

    if (!loading) return null;

    return (
        <>
            {/* Top Loading Bar - HomeBuddy Orange */}
            <div className="fixed top-0 left-0 right-0 z-100 h-1 bg-linear-to-r from-transparent via-[#F4A261] to-transparent">
                <div className="h-full w-full bg-[#F4A261] animate-loading-bar" />
            </div>

            {/* Full screen overlay with CircularText spinner */}
            <div className="fixed inset-0 z-99 flex items-center justify-center pointer-events-none" style={{ backgroundColor: "rgba(250, 243, 224, 0.8)", backdropFilter: "blur(4px)" }}>
                <div className="flex flex-col items-center gap-4 pointer-events-auto">
                    {/* Circular spinning text */}
                    <CircularText 
                        text="HOMEBUDDY • LOADING • "
                        spinDuration={6}
                        onHover="goBonkers"
                        className="text-[#F4A261]"
                    />
                    
                    {/* Center house icon */}
                    <div className="absolute">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: "#FFFFFF" }}>
                            <span className="text-3xl">🏠</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}