'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { NewsItem } from '@/lib/news'
import type { Event, Sport } from '@/lib/types'
import { SPORTS } from '@/lib/data'

// Same sport → badge color mapping as EventCard.tsx, duplicated locally
// (kept small and self-contained rather than exporting it out of EventCard)
// so the ticket-CTA tile's badge matches the homepage's exactly.
const SPORT_STYLES: Record<string, string> = {
  WNBA: 'bg-orange-100 text-orange-700',
  NWSL: 'bg-emerald-100 text-emerald-700',
  PWHL: 'bg-cyan-100 text-cyan-700',
  Tennis: 'bg-lime-100 text-lime-700',
  Golf: 'bg-green-100 text-green-700',
  College: 'bg-blue-100 text-blue-700',
}

// Same per-market text color mapping as EventCard.tsx, duplicated locally
// for the same reason as SPORT_STYLES above.
const MARKET_TEXT: Record<string, string> = {
  Ticketmaster: 'text-blue-700',
  SeatGeek: 'text-orange-600',
  StubHub: 'text-rose-600',
  'Vivid Seats': 'text-purple-700',
}

type Tile = { kind: 'news'; item: NewsItem; big: boolean } | { kind: 'cta'; event: Event }

const CTA_EVERY = 7

const SORT_OPTIONS = ['Most Recent', 'Alphabetical', 'By League'] as const
type SortOption = (typeof SORT_OPTIONS)[number]

function sortItems(items: NewsItem[], sort: SortOption): NewsItem[] {
  const out = [...items]
  if (sort === 'Alphabetical') {
    out.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sort === 'By League') {
    out.sort((a, b) => a.league.localeCompare(b.league) || b.publishedAt.localeCompare(a.publishedAt))
  }
  // 'Most Recent' — items already arrive sorted by publishedAt desc from the API
  return out
}

function buildTiles(items: NewsItem[], events: Event[]): Tile[] {
  const tiles: Tile[] = []
  const usedEventIds = new Set<string>()
  let cursor = 0

  function nextEvent(preferredSport: NewsItem['league']): Event | null {
    if (preferredSport !== "Women's Sports") {
      const match = events.find((e) => e.sport === preferredSport && !usedEventIds.has(e.id))
      if (match) {
        usedEventIds.add(match.id)
        return match
      }
    }
    while (cursor < events.length) {
      const e = events[cursor++]
      if (!usedEventIds.has(e.id)) {
        usedEventIds.add(e.id)
        return e
      }
    }
    return null
  }

  items.forEach((item, i) => {
    tiles.push({ kind: 'news', item, big: i % CTA_EVERY === 0 })
    if ((i + 1) % CTA_EVERY === 0) {
      const event = nextEvent(item.league)
      if (event) tiles.push({ kind: 'cta', event })
    }
  })

  return tiles
}

// Same footprint as a regular small news tile (col-span-1 row-span-1,
// 180px tall) and same content set as EventCard (title, venue/location,
// every market's price with "Best price" highlighting) — just scaled
// down to fit. Outer container uses the same dark gradient as the
// hero/header (Header.tsx, app/page.tsx), is vertically centered
// (`justify-center`) so leftover space for events with fewer markets
// splits above/below the white box, and carries the sport badge itself
// (with a ticket icon) absolutely positioned in the top-left corner —
// outside the white box, on the dark background — so it reads as "this
// is a ticket promo for [sport]" at a glance rather than blending into
// the card's own content.
function TicketCTATile({ event }: { event: Event }) {
  const priceValues = event.markets.map((m) => m.minPrice).filter((p) => p > 0)
  const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : null
  const hasComparablePrices = priceValues.length >= 2
  const badgeStyle = SPORT_STYLES[event.sport] ?? 'bg-gray-100 text-gray-600'

  return (
    <div
      className="relative col-span-1 row-span-1 rounded-xl p-1.5 flex flex-col justify-center"
      style={{ background: 'linear-gradient(135deg, #060011 0%, #1a0638 45%, #2a0a50 55%, #060011 100%)' }}
    >
      <span className={`absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none ${badgeStyle}`}>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
        </svg>
        {event.sport}
      </span>

      <div className="bg-white rounded-lg px-2 py-1.5">
        <h3 className="text-[11px] font-bold text-gray-900 leading-tight truncate">{event.title}</h3>
        <p className="text-[9px] text-gray-500 truncate">{event.venue} · {event.city}, {event.state}</p>

        <div className="mt-1 flex flex-col gap-0.5">
          {event.markets.slice(0, 4).map((m) => {
            const hasPrice = m.minPrice > 0
            const isBest = hasComparablePrices && hasPrice && m.minPrice === lowestPrice
            return (
              <a
                key={m.market}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between gap-1 px-1.5 py-0.5 rounded-md text-[9px] leading-tight hover:opacity-75 ${
                  isBest ? 'bg-emerald-50' : 'bg-gray-50'
                }`}
              >
                <span className={`font-bold truncate ${MARKET_TEXT[m.market] ?? 'text-gray-600'}`}>
                  {m.market}
                </span>
                <span className={`font-bold shrink-0 ${isBest ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {hasPrice ? `$${m.minPrice}` : 'Tickets'}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NewsTile({ item, big }: { item: NewsItem; big: boolean }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative group overflow-hidden rounded-xl bg-neutral-900 ${
        big ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
      }`}
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a2a70] to-[#1a0638]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 p-3 text-white">
        <span className="text-[10px] uppercase tracking-wide bg-white/20 rounded px-1.5 py-0.5">
          {item.league}
        </span>
        <h3 className={`mt-1 font-semibold leading-tight ${big ? 'text-lg' : 'text-sm'}`}>
          {item.title}
        </h3>
        <span className="text-[10px] text-white/60">{item.source}</span>
      </div>
    </a>
  )
}

export default function NewsMosaic({ events }: { events: Event[] }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [activeSport, setActiveSport] = useState<Sport | 'All'>('All')
  const [sort, setSort] = useState<SortOption>('Most Recent')

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  const filteredItems = useMemo(
    () => (activeSport === 'All' ? items : items.filter((i) => i.league === activeSport)),
    [items, activeSport],
  )
  const sortedItems = useMemo(() => sortItems(filteredItems, sort), [filteredItems, sort])
  const filteredEvents = useMemo(
    () => (activeSport === 'All' ? events : events.filter((e) => e.sport === activeSport)),
    [events, activeSport],
  )
  const tiles = useMemo(
    () => buildTiles(sortedItems, filteredEvents),
    [sortedItems, filteredEvents],
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          See all ticket listings
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-4">Women&apos;s Sports News</h1>

      {/* Sort + sport filter pills */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="sm:w-52 px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9966CB] cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 flex-wrap">
          {(['All', ...SPORTS] as const).map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeSport === sport
                  ? 'bg-[#9966CB] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#c4a0e0] hover:text-[#9966CB]'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {loaded && items.length === 0 && (
        <p className="text-sm text-gray-400 py-12 text-center">No news available right now — check back soon.</p>
      )}
      {loaded && items.length > 0 && filteredItems.length === 0 && (
        <p className="text-sm text-gray-400 py-12 text-center">No {activeSport} news right now — try a different sport.</p>
      )}

      <div className="grid grid-flow-dense grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-3">
        {tiles.map((tile) =>
          tile.kind === 'news' ? (
            <NewsTile key={tile.item.id} item={tile.item} big={tile.big} />
          ) : (
            <TicketCTATile key={`cta-${tile.event.id}`} event={tile.event} />
          ),
        )}
      </div>
    </div>
  )
}
