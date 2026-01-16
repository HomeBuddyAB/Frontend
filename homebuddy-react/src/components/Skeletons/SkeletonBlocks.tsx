export function SkeletonHero() {
    return (
        <section className="px-6 py-24 md:py-32" style={{ backgroundColor: "#171010" }}>
            <div className="max-w-7xl mx-auto">
                <div className="space-y-4">
                    <div className="h-14 md:h-20 w-3/4 rounded animate-pulse" style={{ backgroundColor: "#2B2B2B" }} />
                    <div className="h-14 md:h-20 w-2/3 rounded animate-pulse" style={{ backgroundColor: "#2B2B2B" }} />
                </div>
            </div>
        </section>
    );
}

export function SkeletonProductGrid() {
    return (
        <section className="px-6 py-20" style={{ backgroundColor: "#2B2B2B" }}>
            <div className="max-w-7xl mx-auto">
                <div className="h-9 w-64 mx-auto mb-12 rounded animate-pulse" style={{ backgroundColor: "#362222" }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i}>
                            <div className="aspect-square mb-4 rounded animate-pulse" style={{ backgroundColor: "#171010" }} />
                            <div className="h-6 w-3/4 mb-2 rounded animate-pulse" style={{ backgroundColor: "#362222" }} />
                            <div className="h-5 w-1/2 rounded animate-pulse" style={{ backgroundColor: "#362222" }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function SkeletonCategories() {
    return (
        <section className="px-6 py-20" style={{ backgroundColor: "#171010" }}>
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-8 rounded" style={{ backgroundColor: "#2B2B2B" }}>
                            <div className="h-8 w-32 mb-3 rounded animate-pulse" style={{ backgroundColor: "#362222" }} />
                            <div className="h-5 w-full mb-2 rounded animate-pulse" style={{ backgroundColor: "#362222" }} />
                            <div className="h-5 w-4/5 rounded animate-pulse" style={{ backgroundColor: "#362222" }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function SkeletonSimplePage() {
    return (
        <main className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#171010" }}>
            <div className="text-center space-y-4">
                <div className="h-10 w-64 mx-auto rounded animate-pulse" style={{ backgroundColor: "#2B2B2B" }} />
                <div className="h-6 w-48 mx-auto rounded animate-pulse" style={{ backgroundColor: "#2B2B2B" }} />
            </div>
        </main>
    );
}