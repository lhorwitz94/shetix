import { events } from '@/lib/data'
import EventsClient from './components/EventsClient'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-3">
            Women&apos;s sports tickets,{' '}
            <span className="text-violet-600">all in one place</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Compare listings from Ticketmaster, SeatGeek, StubHub, and Vivid Seats across
            WNBA, NWSL, tennis, golf, and college sports.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            {[
              { label: 'Markets', value: '4+' },
              { label: 'Sports', value: '5' },
              { label: 'Upcoming Events', value: String(events.length) },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-violet-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EventsClient events={events} />
    </main>
  )
}
