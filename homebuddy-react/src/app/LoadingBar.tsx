// components/LoadingBar.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
            {/* Top Loading Bar */}
            <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-transparent via-[#8B4545] to-transparent">
                <div className="h-full w-full bg-[#8B4545] animate-loading-bar" />
            </div>

            {/* Optional: Full screen overlay with spinner */}
            <div className="fixed inset-0 z-99 bg-black/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#8B4545] border-t-transparent rounded-full animate-spin" />
                    <p className="text-white text-sm font-medium">Loading...</p>
                </div>
            </div>
        </>
    );
}