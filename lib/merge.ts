import type { Event } from './types'

// Tokenize a title into meaningful words for fuzzy matching
function tokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['versus', 'game', 'ticket'].includes(w)),
  )
}

// Two events are the same game if they share the same date + city and their
// titles overlap significantly (≥50% of the smaller token set matches).
function isSameEvent(a: Event, b: Event): boolean {
  if (a.date !== b.date) return false
  if (a.city.toLowerCase() !== b.city.toLowerCase()) return false

  const ta = tokens(a.title)
  const tb = tokens(b.title)
  const minSize = Math.min(ta.size, tb.size)
  if (minSize === 0) return false

  let overlap = 0
  for (const t of ta) {
    if (tb.has(t)) overlap++
  }

  return overlap / minSize >= 0.5
}

// Merge SeatGeek events into Ticketmaster events where they represent the same
// game. SeatGeek-only events are appended at the end.
export function mergeEventSources(primary: Event[], secondary: Event[]): Event[] {
  const result: Event[] = primary.map((e) => ({ ...e, markets: [...e.markets] }))

  for (const sgEvent of secondary) {
    // Only look at primary events with the same sport to reduce false matches
    const matchIdx = result.findIndex(
      (e) => e.sport === sgEvent.sport && isSameEvent(e, sgEvent),
    )

    if (matchIdx !== -1) {
      // Merge: add SeatGeek market to the existing event if not already present
      const existing = result[matchIdx]
      const alreadyHasSG = existing.markets.some((m) => m.market === 'SeatGeek')
      if (!alreadyHasSG) {
        existing.markets.push(...sgEvent.markets)
      }
    } else {
      result.push(sgEvent)
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date))
}
