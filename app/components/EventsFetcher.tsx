import { fetchWomensSportsEvents } from '@/lib/ticketmaster'
import EventsClient from './EventsClient'

export default async function EventsFetcher() {
  const events = await fetchWomensSportsEvents()
  return <EventsClient events={events} />
}
