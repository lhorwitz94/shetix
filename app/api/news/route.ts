import { NextResponse } from 'next/server'
import { fetchNewsItems } from '@/lib/news'
import { getAllTrustedVideos } from '@/lib/youtube'
import { readNewsArchive, isFresh, mergeNewsArchive } from '@/lib/newsCache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const archive = await readNewsArchive()
  if (archive && isFresh(archive)) return NextResponse.json(archive.items)

  // allSettled (not all) so a YouTube-fetch failure can't take down the
  // already-working article feed — worst case, videos just don't show up.
  // A failed/thin fetch also can't regress the archive: mergeNewsArchive
  // only adds to what's already persisted, never replaces it wholesale.
  const [articlesResult, videosResult] = await Promise.allSettled([
    fetchNewsItems(),
    getAllTrustedVideos(),
  ])

  const articles = articlesResult.status === 'fulfilled' ? articlesResult.value : []
  const videos = videosResult.status === 'fulfilled' ? videosResult.value : []

  const merged = await mergeNewsArchive(archive?.items ?? [], [...articles, ...videos])
  return NextResponse.json(merged)
}
