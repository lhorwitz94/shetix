import type { Event, Market } from '@/lib/types'

const SPORT_STYLES: Record<string, string> = {
  WNBA: 'bg-orange-100 text-orange-700',
  NWSL: 'bg-emerald-100 text-emerald-700',
  Tennis: 'bg-lime-100 text-lime-700',
  Golf: 'bg-green-100 text-green-700',
  College: 'bg-blue-100 text-blue-700',
}

const MARKET_STYLES: Record<Market, string> = {
  Ticketmaster: 'bg-blue-600',
  SeatGeek: 'bg-orange-500',
  StubHub: 'bg-rose-600',
  'Vivid Seats': 'bg-purple-600',
}

const MARKET_SHORT: Record<Market, string> = {
  Ticketmaster: 'TM',
  SeatGeek: 'SG',
  StubHub: 'SH',
  'Vivid Seats': 'VS',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function EventCard({ event }: { event: Event }) {
  const priceValues = event.markets.map((m) => m.minPrice).filter((p) => p > 0)
  const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : null
  const badgeStyle = SPORT_STYLES[event.sport] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeStyle}`}>
            {event.sport}
          </span>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500">{formatDate(event.date)}</p>
            <p className="text-xs text-gray-400">{event.time}</p>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">{event.title}</h3>
        {event.subtitle && (
          <p className="text-xs text-violet-600 font-medium mb-2">{event.subtitle}</p>
        )}

        <p className="text-sm text-gray-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {event.venue} · {event.city}, {event.state}
        </p>
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between gap-3 bg-gray-50">
        <div>
          {lowestPrice !== null ? (
            <>
              <p className="text-xs text-gray-400 leading-none mb-0.5">From</p>
              <p className="text-lg font-bold text-gray-900">${lowestPrice}</p>
            </>
          ) : (
            <p className="text-sm font-medium text-gray-500">See prices</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {event.markets.map((m) => (
            <a
              key={m.market}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              title={m.minPrice > 0 ? `${m.market} — from $${m.minPrice}` : m.market}
              className={`text-white text-[10px] font-bold px-2 py-1 rounded-md ${MARKET_STYLES[m.market]} hover:opacity-80 transition-opacity`}
            >
              {MARKET_SHORT[m.market]}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
