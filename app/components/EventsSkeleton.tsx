export default function EventsSkeleton() {
  return (
    <div>
      {/* Search + sort bar skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-10 rounded-xl bg-gray-200 animate-pulse" />
        <div className="sm:w-52 h-10 rounded-xl bg-gray-200 animate-pulse" />
      </div>

      {/* Sport filter pills skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex gap-2">
        {['All', 'WNBA', 'NWSL', 'Tennis', 'Golf', 'College'].map((s) => (
          <div
            key={s}
            className="h-8 rounded-full bg-gray-200 animate-pulse"
            style={{ width: `${s.length * 10 + 20}px` }}
          />
        ))}
      </div>

      {/* Card grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-5 w-20 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-between items-center">
                <div className="h-6 w-12 rounded bg-gray-200 animate-pulse" />
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-6 w-8 rounded-md bg-gray-200 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
