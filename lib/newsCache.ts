import type { NewsItem } from './news'

const CACHE_KEY = 'wtix:news'
const CACHE_TTL_SECONDS = 60 * 30

async function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  const { Redis } = await import('@upstash/redis')
  return Redis.fromEnv()
}

// Returns null on a cache miss or when Redis isn't configured (e.g. local dev) —
// callers should fetch live in that case.
export async function readNewsCache(): Promise<NewsItem[] | null> {
  const redis = await getRedis()
  if (!redis) return null
  return (await redis.get<NewsItem[]>(CACHE_KEY)) ?? null
}

export async function writeNewsCache(items: NewsItem[]): Promise<void> {
  const redis = await getRedis()
  if (!redis) return
  await redis.set(CACHE_KEY, items, { ex: CACHE_TTL_SECONDS })
}
