import type { NewsItem } from './news'

const ARCHIVE_KEY = 'wtix:news:archive'

// Throttle for live re-fetching, not for how long items are kept — a fetch
// within this window just serves the persisted archive as-is.
const FETCH_THROTTLE_MS = 30 * 60 * 1000

// Safety-net age cutoff so a near-dead league doesn't hold on to a link
// forever; PER_LEAGUE_CAP is what actually bites in practice.
const MAX_AGE_MS = 120 * 24 * 60 * 60 * 1000

// Retention is per-league (not a single global cap) so a high-volume league
// like WNBA — which can produce more items in a day than a low-volume one
// like NWSL sees in a month — can't crowd NWSL's history out of a shared
// budget. Each league keeps its own most-recent PER_LEAGUE_CAP items.
const PER_LEAGUE_CAP = 50

interface NewsArchive {
  items: NewsItem[]
  lastFetchedAt: string
}

// wtix's Vercel project provisions Redis via Vercel's Marketplace
// integration, which names the REST API vars KV_REST_API_URL /
// KV_REST_API_TOKEN — not UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN,
// which is what @upstash/redis's Redis.fromEnv() looks for by default.
// Construct the client explicitly against the vars that actually exist
// (confirmed present in the Vercel dashboard) instead of relying on
// fromEnv()'s naming assumption.
async function getRedis() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  const { Redis } = await import('@upstash/redis')
  return new Redis({ url, token })
}

// Returns null when Redis isn't configured (e.g. local dev) or nothing has
// been fetched yet — callers should live-fetch in that case.
export async function readNewsArchive(): Promise<NewsArchive | null> {
  const redis = await getRedis()
  if (!redis) return null
  return (await redis.get<NewsArchive>(ARCHIVE_KEY)) ?? null
}

export function isFresh(archive: NewsArchive): boolean {
  return Date.now() - new Date(archive.lastFetchedAt).getTime() < FETCH_THROTTLE_MS
}

// Merges freshly-fetched items into the existing archive (dedup by link,
// the fresh copy wins on conflict since it's more up to date), then applies
// per-league retention. This never shrinks because a live fetch came back
// thin — that's the point: an item stops disappearing just because a
// source's own live feed rotated past it before this ran again.
export async function mergeNewsArchive(
  existing: NewsItem[],
  freshItems: NewsItem[],
): Promise<NewsItem[]> {
  const byLink = new Map<string, NewsItem>()
  for (const item of existing) byLink.set(item.link, item)
  for (const item of freshItems) byLink.set(item.link, item)

  const cutoff = Date.now() - MAX_AGE_MS
  const notExpired = [...byLink.values()].filter(
    (item) => new Date(item.publishedAt).getTime() >= cutoff,
  )

  const byLeague = new Map<string, NewsItem[]>()
  for (const item of notExpired) {
    const bucket = byLeague.get(item.league)
    if (bucket) bucket.push(item)
    else byLeague.set(item.league, [item])
  }

  const merged = [...byLeague.values()]
    .flatMap((bucket) =>
      bucket
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, PER_LEAGUE_CAP),
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const redis = await getRedis()
  if (redis) {
    const archive: NewsArchive = { items: merged, lastFetchedAt: new Date().toISOString() }
    await redis.set(ARCHIVE_KEY, archive)
  }

  return merged
}
