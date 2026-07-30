import type { Metadata } from 'next'
import NewsMosaic from '../components/NewsMosaic'
import { fetchWomensSportsEvents } from '@/lib/ticketmaster'
import { fetchSeatGeekEvents } from '@/lib/seatgeek'
import { mergeEventSources } from '@/lib/merge'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'News — wtix',
  description: "Latest women's sports news from across WNBA, NWSL, PWHL, tennis, golf, and college sports.",
}

export default async function NewsPage() {
  const [tmEvents, sgEvents] = await Promise.all([
    fetchWomensSportsEvents(),
    fetchSeatGeekEvents(),
  ])
  const events = mergeEventSources(tmEvents, sgEvents)

  return (
    <main className="flex-1 bg-gray-50">
      <NewsMosaic events={events} />
    </main>
  )
}
