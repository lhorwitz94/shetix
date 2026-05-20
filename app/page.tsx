import { Suspense } from 'react'
import EventsFetcher from './components/EventsFetcher'
import EventsSkeleton from './components/EventsSkeleton'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-3">
            Women&apos;s sports tickets,{' '}
            <span className="text-[#9966CB]">all in one place</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Live listings from across WNBA, NWSL, tennis, golf, hockey, and college sports.
          </p>
        </div>
      </div>

      <Suspense fallback={<EventsSkeleton />}>
        <EventsFetcher />
      </Suspense>
    </main>
  )
}
