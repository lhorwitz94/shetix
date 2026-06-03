import type { Event, Sport } from './types'

const BASE = 'https://app.ticketmaster.com/discovery/v2/events.json'

// ── Ticketmaster response shapes ─────────────────────────────────────────────

interface TMVenue {
  name?: string
  city?: { name: string }
  state?: { name: string; stateCode: string }
  country?: { name: string; countryCode: string }
}

interface TMEvent {
  id: string
  name: string
  url: string
  dates: {
    start: {
      localDate?: string
      localTime?: string
    }
  }
  priceRanges?: Array<{ type: string; min: number; max: number }>
  _embedded?: { venues?: TMVenue[] }
}

interface TMPage {
  _embedded?: { events?: TMEvent[] }
}

// ── Queries ───────────────────────────────────────────────────────────────────

interface Query {
  sport: Sport
  keyword?: string
  classificationName?: string
  countryCode?: string
}

const QUERIES: Query[] = [
  { sport: 'WNBA',    keyword: 'WNBA',                                    countryCode: 'US' },
  { sport: 'NWSL',    keyword: 'NWSL',                                    countryCode: 'US' },
  { sport: 'PWHL',    keyword: 'PWHL'                                                       },
  { sport: 'Tennis',  keyword: 'WTA'                                                        },
  { sport: 'Golf',    keyword: 'Women', classificationName: 'Golf'                          },
  { sport: 'College', keyword: 'NCAA Women',                               countryCode: 'US' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 19) + 'Z'
}

function formatTime(localTime?: string): string {
  if (!localTime) return 'TBD'
  const [h, m] = localTime.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = ((h + 11) % 12) + 1
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

function mapEvent(tm: TMEvent, sport: Sport): Event | null {
  const venue = tm._embedded?.venues?.[0]
  const date = tm.dates.start.localDate
  if (!date) return null

  const price = tm.priceRanges?.find((p) => p.type === 'standard') ?? tm.priceRanges?.[0]

  return {
    id: tm.id,
    sport,
    title: tm.name,
    venue: venue?.name ?? 'TBA',
    city: venue?.city?.name ?? '',
    state: venue?.state?.stateCode ?? venue?.country?.countryCode ?? '',
    date,
    time: formatTime(tm.dates.start.localTime),
    markets: price
      ? [{ market: 'Ticketmaster', minPrice: Math.round(price.min), url: tm.url }]
      : [{ market: 'Ticketmaster', minPrice: 0, url: tm.url }],
  }
}

async function fetchSport({ sport, keyword, classificationName, countryCode }: Query): Promise<Event[]> {
  const params = new URLSearchParams({
    apikey: process.env.TICKETMASTER_API_KEY!,
    segmentName: 'Sports',
    startDateTime: todayISO(),
    size: '200',
    sort: 'date,asc',
  })
  if (keyword) params.set('keyword', keyword)
  if (classificationName) params.set('classificationName', classificationName)
  if (countryCode) params.set('countryCode', countryCode)

  const res = await fetch(`${BASE}?${params}`, { cache: 'no-store' })
  if (!res.ok) return []

  const data: TMPage = await res.json()
  return (data._embedded?.events ?? [])
    .map((e) => mapEvent(e, sport))
    .filter((e): e is Event => e !== null)
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchWomensSportsEvents(): Promise<Event[]> {
  const results = await Promise.allSettled(QUERIES.map(fetchSport))

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

  return events.sort((a, b) => a.date.localeCompare(b.date))
}
