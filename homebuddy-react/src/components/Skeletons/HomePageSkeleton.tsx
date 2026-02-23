export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#FAF3E0" }}>
      {/* Compact Hero Skeleton */}
      <section className="relative px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl space-y-5">
              <div className="h-9 w-40 rounded-full animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
              <div className="h-14 md:h-16 w-full max-w-md rounded animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
              <div className="h-5 w-full max-w-lg rounded animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <div className="flex-1 h-12 rounded-lg animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
                <div className="h-12 w-28 rounded-lg animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
              </div>
              <div className="flex gap-3">
                <div className="h-14 w-32 rounded-lg animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
                <div className="h-14 w-28 rounded-lg animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
              </div>
            </div>
            <div className="w-full lg:w-80 aspect-square rounded-2xl animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
          </div>
        </div>
      </section>

      {/* Category rows skeleton - side-scrollable rows */}
      <section className="py-6 pb-4" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="h-8 w-56 rounded animate-pulse mb-2" style={{ backgroundColor: "#E8DCC4" }} />
          <div className="h-5 w-72 rounded animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
        </div>
        <div className="space-y-14">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-center mb-5">
                <div className="h-7 w-32 rounded animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
                <div className="h-5 w-20 rounded animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
              </div>
              <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[280px] rounded-xl border-2 overflow-hidden animate-pulse" style={{ borderColor: "#E8DCC4", backgroundColor: "#F5ECD4" }}>
                    <div className="aspect-square bg-white/50" />
                    <div className="p-4 space-y-2">
                      <div className="h-5 w-3/4 rounded" style={{ backgroundColor: "#E8DCC4" }} />
                      <div className="h-6 w-1/3 rounded" style={{ backgroundColor: "#E8DCC4" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Skeleton */}
      <section className="py-14 px-6" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="h-8 w-48 mx-auto rounded animate-pulse" style={{ backgroundColor: "#E8DCC4" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl border-2 animate-pulse" style={{ borderColor: "#E8DCC4", backgroundColor: "#FFFFFF" }}>
                <div className="h-10 w-10 rounded-full mx-auto mb-3" style={{ backgroundColor: "#E8DCC4" }} />
                <div className="h-5 w-28 mx-auto rounded mb-2" style={{ backgroundColor: "#E8DCC4" }} />
                <div className="h-4 w-full rounded" style={{ backgroundColor: "#E8DCC4" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Skeleton */}
      <section className="px-6 py-16" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-8 md:p-10 animate-pulse" style={{ backgroundColor: "#E8DCC4" }}>
            <div className="h-8 w-64 mx-auto rounded mb-3" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
            <div className="h-5 w-80 mx-auto rounded mb-6" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
              <div className="h-12 w-28 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
