import { fetchWomensSportsEvents } from '@/lib/ticketmaster'
import { fetchSeatGeekEvents } from '@/lib/seatgeek'
import { mergeEventSources } from '@/lib/merge'
import EventsClient from './EventsClient'

export default async function EventsFetcher() {
  const [tmEvents, sgEvents] = await Promise.all([
    fetchWomensSportsEvents(),
    fetchSeatGeekEvents(),
  ])

  const events = mergeEventSources(tmEvents, sgEvents)
  return <EventsClient events={events} />
}
