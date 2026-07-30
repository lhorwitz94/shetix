import { NextResponse } from 'next/server'
import { fetchNewsItems } from '@/lib/news'
import { getAllTrustedVideos } from '@/lib/youtube'
import { readNewsCache, writeNewsCache } from '@/lib/newsCache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cached = await readNewsCache()
  if (cached) return NextResponse.json(cached)

  // allSettled (not all) so a YouTube-fetch failure can't take down the
  // already-working article feed — worst case, videos just don't show up.
  const [articlesResult, videosResult] = await Promise.allSettled([
    fetchNewsItems(),
    getAllTrustedVideos(),
  ])

  const articles = articlesResult.status === 'fulfilled' ? articlesResult.value : []
  const videos = videosResult.status === 'fulfilled' ? videosResult.value : []

  const items = [...articles, ...videos].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )

  await writeNewsCache(items)
  return NextResponse.json(items)
}
