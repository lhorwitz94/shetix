'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { NewsItem } from '@/lib/news'
import type { Event, Sport } from '@/lib/types'
import { SPORTS } from '@/lib/data'

type Tile = { kind: 'news'; item: NewsItem; big: boolean } | { kind: 'cta'; event: Event }

const CTA_EVERY = 7

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

function formatShortDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function TicketCTATile({ event }: { event: Event }) {
  const priceValues = event.markets.map((m) => m.minPrice).filter((p) => p > 0)
  const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : null
  const bestMarket = lowestPrice != null
    ? event.markets.find((m) => m.minPrice === lowestPrice)
    : event.markets[0]

  return (
    <a
      href={bestMarket?.url ?? '/'}
      target="_blank"
      rel="noopener noreferrer"
      className="relative col-span-1 row-span-1 overflow-hidden rounded-xl flex flex-col justify-between p-3 text-white hover:opacity-90 transition-opacity"
      style={{ background: 'linear-gradient(135deg, #7d3fc4 0%, #9966CB 60%, #b57de0 100%)' }}
    >
      <div className="flex items-center gap-1">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
        </svg>
        <span className="text-[9px] font-bold uppercase tracking-wide">{event.sport} Tickets</span>
      </div>
      <div>
        <h3 className="text-xs font-bold leading-tight line-clamp-2">{event.title}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-white/70">{formatShortDate(event.date)}</span>
          <span className="text-[11px] font-bold whitespace-nowrap">
            {lowestPrice ? `$${lowestPrice}+` : 'See tix'}
          </span>
        </div>
      </div>
    </a>
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
  const filteredEvents = useMemo(
    () => (activeSport === 'All' ? events : events.filter((e) => e.sport === activeSport)),
    [events, activeSport],
  )
  const tiles = useMemo(
    () => buildTiles(filteredItems, filteredEvents),
    [filteredItems, filteredEvents],
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

      {/* Sport filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
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

      {loaded && items.length === 0 && (
        <p className="text-sm text-gray-400 py-12 text-center">No news available right now — check back soon.</p>
      )}
      {loaded && items.length > 0 && filteredItems.length === 0 && (
        <p className="text-sm text-gray-400 py-12 text-center">No {activeSport} news right now — try a different sport.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-3">
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
