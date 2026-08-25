'use client'

import { useEffect, useMemo, useState } from 'react'
import type { NewsItem } from '@/lib/news'
import type { Event, Sport } from '@/lib/types'
import { SPORTS } from '@/lib/data'
import PreviewModal from './PreviewModal'
import { supportingFont } from '../fonts'

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

// Personalized-feed preferences: the same search + sport filter someone
// leaves the page with is what they see next visit, matching the "save
// this to personalize your feed" request rather than resetting every load.
const PREFS_KEY = 'wyn-feed-prefs'

interface FeedPrefs {
  search: string
  sport: Sport | 'All'
}

function loadFeedPrefs(): FeedPrefs {
  if (typeof window === 'undefined') return { search: '', sport: 'All' }
  try {
    const raw = window.localStorage.getItem(PREFS_KEY)
    if (!raw) return { search: '', sport: 'All' }
    const parsed = JSON.parse(raw)
    return {
      search: typeof parsed.search === 'string' ? parsed.search : '',
      sport: parsed.sport === 'All' || SPORTS.includes(parsed.sport) ? parsed.sport : 'All',
    }
  } catch {
    return { search: '', sport: 'All' }
  }
}

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

// col-span-1 row-span-1 on desktop (~295x180), same as before. On
// mobile, col-span-2 (full width of the 2-col mobile grid, ~358px) —
// at the old col-span-1 mobile width (~173px) the event title's
// `truncate` was visibly cutting titles off mid-word; there wasn't
// room for one line of an 11px bold title plus badge/venue/price rows
// in that narrow a box. Widening (not heightening) fixes that without
// approaching the "big" hero-tile size (col-span-2 row-span-2) — this
// stays row-span-1 on both breakpoints, so it's a wide short card, not
// a tall one, and noticeably smaller in area than the hero tile.
// Title changed from `truncate` (forces one line, hides overflow) to
// `line-clamp-2` as extra headroom for long titles even at the wider
// mobile width. The outer frame reuses the exact hero/header background
// (W_TEXTURE zigzag + dark gradient — same literal values as
// Header.tsx/app/page.tsx) rather than a flat purple, with generous
// padding (p-3) so that frame reads as a thick border, not a thin
// sliver. A white box sits centered in the middle of that frame holding
// all the actual content (badge, title, venue, price rows).
const W_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='44'%3E%3Cpath d='M0 0 L20 34 L40 14 L60 34 L80 0' stroke='%239966CB' stroke-width='1.5' fill='none' opacity='0.15'/%3E%3C/svg%3E")`

// Same weekday/month/day format as EventCard.tsx's formatDate, duplicated
// locally for the same reason as SPORT_STYLES/MARKET_TEXT above.
function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function TicketCTATile({ event }: { event: Event }) {
  const priceValues = event.markets.map((m) => m.minPrice).filter((p) => p > 0)
  const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : null
  const hasComparablePrices = priceValues.length >= 2
  const badgeStyle = SPORT_STYLES[event.sport] ?? 'bg-gray-100 text-gray-600'

  return (
    <div
      className="col-span-2 row-span-1 md:col-span-1 rounded-xl p-3 flex flex-col justify-center"
      style={{ background: `${W_TEXTURE}, linear-gradient(135deg, #060011 0%, #1a0638 45%, #2a0a50 55%, #060011 100%)` }}
    >
      <div className="bg-white rounded-lg px-2 py-2 flex flex-col justify-center">
        {/* Sport badge (left) + date/time (right) — same left/right split
            as EventCard.tsx's header row, just at this tile's tiny type
            scale (text-[7px] for the date) so it fits the fixed 180px row
            without pushing the price rows below it out of the frame. */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className={`inline-flex items-center gap-0.5 w-fit text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none ${badgeStyle}`}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
            </svg>
            {event.sport} Tickets
          </span>

          <p className="text-[7px] font-bold leading-tight text-right shrink-0">
            <span className="text-gray-600">🗓️ {formatEventDate(event.date)}</span>
            <br />
            <span className="text-gray-400">{event.time} ET</span>
          </p>
        </div>

        <h3 className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2">{event.title}</h3>
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

function NewsTile({ item, big, onOpen }: { item: NewsItem; big: boolean; onOpen: () => void }) {
  const isVideo = item.contentType === 'video'
  // Videos get a tall vertical widget shape so they stand out from the
  // square/wide article tiles, regardless of the "big every 7th"
  // alternation those use — not chosen per-video based on the source
  // video's real aspect ratio. YouTube's public feed always reports
  // thumbnails as a fixed 480x360 container regardless of the actual
  // video's orientation (verified against real feed data — every entry
  // across every channel reports identical dimensions), so there's no
  // reliable per-video signal to key off from feed data alone. Same
  // column width as a regular tile (not wider) so it packs into the
  // masonry cleanly rather than disrupting the column rhythm.
  //
  // row-span-2 uniformly (not row-span-3 on desktop) — a deliberately
  // more condensed size per explicit "shrink it a little" feedback.
  // Desktop used to bump to row-span-3 (564px tall at ~295px columns,
  // closer to a true 9:16 ratio) but that read as too dominant in the
  // mosaic; row-span-2 (372px) still reads clearly as a portrait/vertical
  // shape (unlike the square small-article tiles or wide big-article
  // tiles) without taking up as much vertical real estate. Mobile's grid
  // is only 2 columns (grid-cols-2 md:grid-cols-4 below, much narrower
  // columns, ~173px) — row-span-2 there was already the compact end of
  // what still reads as portrait; row-span-1 would make it square, same
  // shape as a small article tile, losing the "this is a video" visual
  // distinction entirely, so it stays at row-span-2 for both.
  const sizeClass = isVideo
    ? 'col-span-1 row-span-2'
    : big ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`relative group overflow-hidden rounded-xl bg-neutral-900 w-full h-full text-left ${sizeClass}`}
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          // object-position biased toward the top (not 50% 50%) — most
          // article thumbnails are sports action photography with
          // subjects' heads near the top of the frame, and a dead-center
          // crop was cutting heads off whenever the source photo needed
          // to be cropped vertically to fit the tile. Confirmed by
          // screenshotting real article tiles before/after, not assumed.
          className="absolute inset-0 h-full w-full object-cover object-[center_25%] opacity-70 group-hover:opacity-90 transition-opacity"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a2a70] to-[#1a0638]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 group-hover:scale-110 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 p-3 text-white">
        <span className="text-[10px] uppercase tracking-wide bg-white/20 rounded px-1.5 py-0.5">
          {item.league}
        </span>
        <h3 className={`mt-1 font-semibold leading-tight line-clamp-4 md:line-clamp-none ${big ? 'text-lg' : 'text-sm'}`}>
          {item.title}
        </h3>
        <span className="text-[10px] text-white/60">{item.source}</span>
      </div>
    </button>
  )
}

export default function NewsMosaic({ events }: { events: Event[] }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [activeSport, setActiveSport] = useState<Sport | 'All'>('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('Most Recent')
  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null)
  const [prefsLoaded, setPrefsLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  // Deliberately NOT a useState lazy initializer here: reading
  // localStorage in the initializer produced a reproduced-in-production
  // hydration bug — the SSR pass always sees no window and renders
  // 'All'/'' active, and React's production hydration doesn't reliably
  // repaint already-hydrated DOM attributes (like which sport pill has
  // the active className) to match the client's differing initial
  // value, even though the internal state itself was correct. Loading
  // in an effect after mount avoids that entirely, at the cost of one
  // extra render right after mount (imperceptible in practice).
  useEffect(() => {
    const prefs = loadFeedPrefs()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(prefs.search)
    setActiveSport(prefs.sport)
    setPrefsLoaded(true)
  }, [])

  useEffect(() => {
    if (!prefsLoaded) return
    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ search, sport: activeSport }))
  }, [search, activeSport, prefsLoaded])

  const filteredItems = useMemo(() => {
    let out = activeSport === 'All' ? items : items.filter((i) => i.league === activeSport)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q) ||
          i.excerpt.toLowerCase().includes(q),
      )
    }
    return out
  }, [items, activeSport, search])
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
      {/* The "See all ticket listings" back-link used to live here — moved
          up into the purple hero itself as a circular ticket icon
          (Header.tsx), so it's not duplicated in both places. */}

      {/* Fluid clamp() font-size, not fixed breakpoint steps — a fixed
          13px still overflowed on narrow phones (~360px) since this is
          one long fixed-length line forced to stay on one line
          (whitespace-nowrap). clamp() scales continuously with viewport
          width so it never overflows at any size, not just the specific
          widths tested. */}
      <h1
        className={`${supportingFont.className} text-center text-gray-900 font-bold whitespace-nowrap mb-6`}
        style={{ fontSize: 'clamp(10px, 2.7vw, 18px)' }}
      >
        Your women&apos;s sports feed for content, news, tickets, merch, and more.
      </h1>

      {/* Search on its own row; sort + sport filter pills grouped together
          on the row below (explicitly requested — sort was previously
          stacked with search, separated from the pills, on mobile).
          Same search-by-team/city pattern as the ticket listing page's
          EventsClient; persisted to localStorage so the feed stays
          "personalized" across visits (see loadFeedPrefs). */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="relative w-72 max-w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams or cities…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9966CB] focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-full border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9966CB] cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>

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
        <p className="text-sm text-gray-400 py-12 text-center">
          No {activeSport !== 'All' ? `${activeSport} ` : ''}results{search.trim() ? ` for "${search.trim()}"` : ''}
          {' '}— try a different {search.trim() ? 'search term' : 'sport'}.
        </p>
      )}

      <div className="grid grid-flow-dense grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-3">
        {tiles.map((tile) =>
          tile.kind === 'news' ? (
            <NewsTile
              key={tile.item.id}
              item={tile.item}
              big={tile.big}
              onOpen={() => setPreviewItem(tile.item)}
            />
          ) : (
            <TicketCTATile key={`cta-${tile.event.id}`} event={tile.event} />
          ),
        )}
      </div>

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  )
}
