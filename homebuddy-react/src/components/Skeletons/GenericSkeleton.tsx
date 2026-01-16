export default function GenericSkeleton({ title }: { title?: string }) {
    return (
        <div className="min-h-screen px-6 py-20" style={{ backgroundColor: "#171010" }}>
            <div className="max-w-7xl mx-auto space-y-8">
                {title && (
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                )}
                <div className="h-12 w-64 rounded animate-pulse" style={{ backgroundColor: "#2B2B2B" }} />
                <div className="h-64 w-full rounded animate-pulse" style={{ backgroundColor: "#2B2B2B" }} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded animate-pulse" style={{ backgroundColor: "#2B2B2B" }} />
                    ))}
                </div>
            </div>
        </div>
    );
}