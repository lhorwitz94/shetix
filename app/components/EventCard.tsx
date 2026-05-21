import type { Event, Market } from '@/lib/types'

const SPORT_STYLES: Record<string, string> = {
  WNBA:    'bg-orange-100 text-orange-700',
  NWSL:    'bg-emerald-100 text-emerald-700',
  PWHL:    'bg-cyan-100 text-cyan-700',
  Tennis:  'bg-lime-100 text-lime-700',
  Golf:    'bg-green-100 text-green-700',
  College: 'bg-blue-100 text-blue-700',
}

const MARKET_TEXT: Record<Market, string> = {
  Ticketmaster: 'text-blue-700',
  SeatGeek:     'text-orange-600',
  StubHub:      'text-rose-600',
  'Vivid Seats':'text-purple-700',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function parseEventStart(date: string, time: string): Date {
  const base = new Date(date + 'T00:00:00')
  const match = time.match(/^(\d+):(\d+)\s*(AM|PM)$/i)
  if (!match) return base
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const period = match[3].toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  base.setHours(h, m, 0, 0)
  return base
}

const MS_72H = 72 * 60 * 60 * 1000

export default function EventCard({ event }: { event: Event }) {
  const priceValues = event.markets.map((m) => m.minPrice).filter((p) => p > 0)
  const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : null
  const hasComparablePrices = priceValues.length >= 2
  const badgeStyle = SPORT_STYLES[event.sport] ?? 'bg-gray-100 text-gray-600'

  const now = Date.now()
  const eventStart = parseEventStart(event.date, event.time).getTime()
  const msUntil = eventStart - now
  const isSoon = msUntil > 0 && msUntil <= MS_72H

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeStyle}`}>
            {event.sport}
          </span>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500">
              {isSoon && <span title="Starting within 72 hours">⚡ </span>}
              {formatDate(event.date)}
            </p>
            <p className="text-xs text-gray-400">{event.time}</p>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">{event.title}</h3>
        {event.subtitle && (
          <p className="text-xs text-[#9966CB] font-medium mb-2">{event.subtitle}</p>
        )}

        <p className="text-sm text-gray-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {event.venue} · {event.city}, {event.state}
        </p>
      </div>

      {/* Per-market price rows */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex flex-col gap-1.5">
        {event.markets.map((m) => {
          const hasPrice = m.minPrice > 0
          const isBest = hasComparablePrices && hasPrice && m.minPrice === lowestPrice
          return (
            <a
              key={m.market}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-sm transition-opacity hover:opacity-75 ${
                isBest
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-white border-gray-100'
              }`}
            >
              <span className={`text-xs font-bold ${MARKET_TEXT[m.market]}`}>
                {m.market}
              </span>
              <div className="flex items-center gap-2">
                {isBest && (
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                    Best price
                  </span>
                )}
                <span className={`text-sm font-bold ${isBest ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {hasPrice ? `$${m.minPrice}` : 'See tickets'}
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
