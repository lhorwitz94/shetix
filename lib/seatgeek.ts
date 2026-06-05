import type { Event, Sport } from './types'

const BASE = 'https://api.seatgeek.com/2/events'

// ── SeatGeek response shapes ──────────────────────────────────────────────────

interface SGVenue {
  name?: string
  city?: string
  state?: string
  country?: string
}

interface SGEvent {
  id: number
  title: string
  url: string
  datetime_local: string
  stats: { lowest_price?: number | null }
  venue: SGVenue
}

interface SGResponse {
  events: SGEvent[]
}

// ── Queries ───────────────────────────────────────────────────────────────────

const QUERIES: { sport: Sport; keyword: string }[] = [
  { sport: 'WNBA',    keyword: 'WNBA'        },
  { sport: 'NWSL',    keyword: 'NWSL'        },
  { sport: 'PWHL',    keyword: 'PWHL'        },
  { sport: 'Golf',    keyword: 'LPGA'        },
  { sport: 'Golf',    keyword: 'KPMG Women'  },
  { sport: 'Golf',    keyword: 'CPKC Women'  },
  { sport: 'College', keyword: 'NCAA Women'  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayLocal() {
  return new Date().toISOString().slice(0, 19)
}

function formatTime(datetime: string): string {
  const d = new Date(datetime)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function mapEvent(sg: SGEvent, sport: Sport): Event | null {
  const date = sg.datetime_local?.slice(0, 10)
  if (!date) return null

  const price = sg.stats?.lowest_price
  return {
    id: `sg-${sg.id}`,
    sport,
    title: sg.title,
    venue: sg.venue?.name ?? 'TBA',
    city: sg.venue?.city ?? '',
    state: sg.venue?.state ?? sg.venue?.country ?? '',
    date,
    time: formatTime(sg.datetime_local),
    markets: [
      {
        market: 'SeatGeek',
        minPrice: price ? Math.round(price) : 0,
        url: sg.url,
      },
    ],
  }
}

async function fetchSport(sport: Sport, keyword: string): Promise<Event[]> {
  const params = new URLSearchParams({
    client_id: process.env.SEATGEEK_CLIENT_ID!,
    q: keyword,
    'datetime_local.gte': todayLocal(),
    per_page: '200',
    sort: 'datetime_local.asc',
  })

  const res = await fetch(`${BASE}?${params}`, { cache: 'no-store' })
  if (!res.ok) return []

  const data: SGResponse = await res.json()
  return (data.events ?? [])
    .map((e) => mapEvent(e, sport))
    .filter((e): e is Event => e !== null)
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchSeatGeekEvents(): Promise<Event[]> {
  const results = await Promise.allSettled(
    QUERIES.map(({ sport, keyword }) => fetchSport(sport, keyword)),
  )

  const seen = new Set<string>()
  const events: Event[] = []

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const event of result.value) {
      if (!seen.has(event.id)) {
        seen.add(event.id)
        events.push(event)
      }
    }
  }

  return events
}
