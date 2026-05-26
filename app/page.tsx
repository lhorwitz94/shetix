import { Suspense } from 'react'
import EventsFetcher from './components/EventsFetcher'
import EventsSkeleton from './components/EventsSkeleton'

// Force this page to SSR on every request so event listings are always fresh
export const dynamic = 'force-dynamic'

const W_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='44'%3E%3Cpath d='M0 0 L20 34 L40 14 L60 34 L80 0' stroke='%239966CB' stroke-width='1.5' fill='none' opacity='0.15'/%3E%3C/svg%3E")`

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero — same dark gradient as the header, seamless continuation */}
      <div
        style={{
          background: `${W_TEXTURE}, linear-gradient(135deg, #060011 0%, #1a0638 45%, #2a0a50 55%, #060011 100%)`,
          backgroundPositionY: '80px', // offset by header height so texture tiles continuously
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: '#ffffff' }}>
            The home for women&apos;s sports tickets.
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
