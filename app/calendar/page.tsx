import { fetchWomensSportsEvents } from '@/lib/ticketmaster'
import { fetchSeatGeekEvents } from '@/lib/seatgeek'
import { mergeEventSources } from '@/lib/merge'
import CalendarClient from './CalendarClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Calendar — wtix',
  description: 'Full calendar of upcoming women\'s sports events across WNBA, NWSL, PWHL, tennis, golf, and college sports.',
}

export default async function CalendarPage() {
  const [tmEvents, sgEvents] = await Promise.all([
    fetchWomensSportsEvents(),
    fetchSeatGeekEvents(),
  ])
  const events = mergeEventSources(tmEvents, sgEvents)

  return (
    <main className="flex-1 bg-gray-50">
      <CalendarClient events={events} />
    </main>
  )
}
