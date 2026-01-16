export default function LoadingSkeleton() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: "#171010" }}>
            {/* Hero Section Skeleton */}
            <section
                className="relative px-6 py-24 md:py-32 overflow-hidden"
                style={{ backgroundColor: "#171010" }}
            >
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="max-w-3xl">
                        {/* Title skeleton */}
                        <div className="mb-6 space-y-4">
                            <div
                                className="h-14 md:h-20 w-3/4 rounded animate-pulse"
                                style={{ backgroundColor: "#2B2B2B" }}
                            />
                            <div
                                className="h-14 md:h-20 w-2/3 rounded animate-pulse"
                                style={{ backgroundColor: "#2B2B2B" }}
                            />
                        </div>

                        {/* Description skeleton */}
                        <div className="mb-8 space-y-3">
                            <div
                                className="h-6 w-full max-w-xl rounded animate-pulse"
                                style={{ backgroundColor: "#2B2B2B" }}
                            />
                            <div
                                className="h-6 w-4/5 max-w-xl rounded animate-pulse"
                                style={{ backgroundColor: "#2B2B2B" }}
                            />
                        </div>

                        {/* Buttons skeleton */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div
                                className="h-14 w-40 rounded animate-pulse"
                                style={{ backgroundColor: "#362222" }}
                            />
                            <div
                                className="h-14 w-52 rounded animate-pulse"
                                style={{ backgroundColor: "#2B2B2B" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Hero image skeleton */}
                <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none z-0">
                    <div
                        className="w-full h-full animate-pulse"
                        style={{ backgroundColor: "#2B2B2B" }}
                    />
                </div>
            </section>

            {/* Featured Products Skeleton */}
            <section className="px-6 py-20" style={{ backgroundColor: "#2B2B2B" }}>
                <div className="max-w-7xl mx-auto">
                    {/* Section title skeleton */}
                    <div className="mb-12 flex justify-center">
                        <div
                            className="h-9 w-64 rounded animate-pulse"
                            style={{ backgroundColor: "#362222" }}
                        />
                    </div>

                    {/* Product grid skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((idx) => (
                            <div key={idx}>
                                <div
                                    className="aspect-square mb-4 rounded animate-pulse"
                                    style={{ backgroundColor: "#171010" }}
                                />
                                <div
                                    className="h-6 w-3/4 mb-2 rounded animate-pulse"
                                    style={{ backgroundColor: "#362222" }}
                                />
                                <div
                                    className="h-5 w-1/2 rounded animate-pulse"
                                    style={{ backgroundColor: "#362222" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Skeleton */}
            <section className="px-6 py-20" style={{ backgroundColor: "#171010" }}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((idx) => (
                            <div
                                key={idx}
                                className="p-8 rounded"
                                style={{ backgroundColor: "#2B2B2B" }}
                            >
                                <div
                                    className="h-8 w-32 mb-3 rounded animate-pulse"
                                    style={{ backgroundColor: "#362222" }}
                                />
                                <div className="space-y-2 mb-4">
                                    <div
                                        className="h-5 w-full rounded animate-pulse"
                                        style={{ backgroundColor: "#362222" }}
                                    />
                                    <div
                                        className="h-5 w-4/5 rounded animate-pulse"
                                        style={{ backgroundColor: "#362222" }}
                                    />
                                </div>
                                <div
                                    className="h-5 w-28 rounded animate-pulse"
                                    style={{ backgroundColor: "#362222" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Skeleton */}
            <section className="px-6 py-20" style={{ backgroundColor: "#362222" }}>
                <div className="max-w-2xl mx-auto text-center">
                    <div className="flex justify-center mb-4">
                        <div
                            className="h-9 w-80 rounded animate-pulse"
                            style={{ backgroundColor: "#2B2B2B" }}
                        />
                    </div>
                    <div className="flex justify-center mb-8">
                        <div
                            className="h-6 w-96 rounded animate-pulse"
                            style={{ backgroundColor: "#2B2B2B" }}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <div
                            className="flex-1 h-12 rounded animate-pulse"
                            style={{ backgroundColor: "#171010" }}
                        />
                        <div
                            className="h-12 w-36 rounded animate-pulse"
                            style={{ backgroundColor: "#2B2B2B" }}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}