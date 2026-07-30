import type { Metadata } from 'next'
import NewsMosaic from '../components/NewsMosaic'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'News — wtix',
  description: "Latest women's sports news from across WNBA, NWSL, PWHL, tennis, golf, and college sports.",
}

export default function NewsPage() {
  return (
    <main className="flex-1 bg-gray-50">
      <NewsMosaic />
    </main>
  )
}
