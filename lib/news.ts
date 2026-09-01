import Parser from 'rss-parser'
import type { Sport } from './types'

// 'Unrivaled' isn't a Sport (no ticket-marketplace presence — Ticketmaster/
// SeatGeek aren't queried for it), it's a news/video-only league, so it's
// added here rather than to lib/types.ts's Sport union.
export type NewsLeague = Sport | "Women's Sports" | 'Unrivaled'

export interface NewsItem {
  id: string
  title: string
  link: string
  source: string
  league: NewsLeague
  image: string | null
  excerpt: string
  publishedAt: string
  contentType: 'article' | 'video'
}

interface RSSItemExtensions {
  media?: { $?: { url?: string } }
  enclosure?: { url?: string }
  'content:encoded'?: string
}

type ParsedItem = Parser.Item & RSSItemExtensions

const parser = new Parser<Record<string, unknown>, ParsedItem>({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['enclosure', 'enclosure'],
    ],
  },
})

// ── Sources ───────────────────────────────────────────────────────────────────
// Verified via curl 2026-07-29. Swish Appeal and The GIST don't publish the
// feed paths commonly referenced elsewhere — corrected below from each site's
// <link rel="alternate" type="application/rss+xml"> tag.

// Fox Sports WNBA was dropped: api.foxsports.com/v2/content/optimized-rss
// returns HTTP 200 with body `<error>Invalid partnerkey</error>` for the
// partnerKey we had — it's dead/revoked, not just empty. Re-add once a live
// partner key is available.
const SOURCES = [
  { name: "Just Women's Sports", url: 'https://justwomenssports.com/feed' },
  { name: 'The Next', url: 'https://thenexthoops.com/feed' },
  { name: 'Swish Appeal', url: 'https://www.swishappeal.com/rss/index.xml' },
  { name: 'The GIST', url: 'https://www.thegistsports.com/rss-daily-sports.xml' },
  { name: 'The GIST — College', url: 'https://www.thegistsports.com/rss-college.xml' },
] as const

// JWS, The Next, and Swish Appeal are 100%-women's-sports-only outlets by
// editorial mission — every item they publish is in scope, even ones that
// don't literally say "women's" (e.g. a general women's-sports-business
// story). The GIST is a general sports newsletter (confirmed by inspecting
// its raw feed 2026-07-29: it runs men's World Cup/Messi/F1 stories
// alongside WNBA/NWSL) — its items need a content-level women's-sports
// check rather than blanket source-level trust.
const TRUSTED_WOMENS_ONLY_SOURCES = new Set<string>([
  "Just Women's Sports",
  'The Next',
  'Swish Appeal',
])

// ── League tagging ───────────────────────────────────────────────────────────

const LEAGUE_KEYWORDS: Record<Sport | 'Unrivaled', string[]> = {
  WNBA: ['wnba', 'caitlin clark', "a'ja wilson", 'napheesa collier'],
  NWSL: ['nwsl', 'uswnt', 'gotham fc', 'angel city'],
  PWHL: ['pwhl', 'hilary knight'],
  Tennis: ['wta', "women's tennis"],
  Golf: ['lpga', "women's golf", "women's pga"],
  College: ["ncaa women", "women's college basketball", "women's college", 'college softball', "women's basketball tournament"],
  Unrivaled: ['unrivaled'],
}

function tagLeague(text: string): NewsItem['league'] {
  const lower = text.toLowerCase()
  for (const [league, keywords] of Object.entries(LEAGUE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return league as Sport | 'Unrivaled'
  }
  return "Women's Sports"
}

// Broader than LEAGUE_KEYWORDS on purpose: used to admit/reject items from
// general-audience sources, so it needs to catch things tagLeague's
// per-league keywords don't (e.g. plain "women's soccer", "ladies").
const WOMENS_SIGNAL_KEYWORDS = [
  ...Object.values(LEAGUE_KEYWORDS).flat(),
  'women',
  "women's",
  'womens',
  'ladies',
  'ncaaw',
]

function isWomensSportsContent(text: string): boolean {
  const lower = text.toLowerCase()
  return WOMENS_SIGNAL_KEYWORDS.some((k) => lower.includes(k))
}

// ── Image extraction ─────────────────────────────────────────────────────────

// Normalizes a raw <img src>/enclosure/media/og:image URL into something
// safe to hotlink from wtix's own domain. Handles: plain absolute URLs,
// protocol-relative ("//host/path"), Gatsby's remote-file proxy path (e.g.
// The GIST: "/_gatsby/file/<hash>/name.jpg?u=<encoded-original>", which
// 404s if hotlinked as-is — the `u` param holds the real original image
// URL), and other site-relative paths resolved against the article's own
// origin when a base URL is available.
function resolveImageUrl(rawSrc: string | undefined | null, baseUrl?: string): string | null {
  if (!rawSrc) return null
  if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) return rawSrc
  if (rawSrc.startsWith('//')) return `https:${rawSrc}`

  try {
    const parsed = new URL(rawSrc, baseUrl ?? 'https://placeholder.invalid')
    const original = parsed.searchParams.get('u')
    if (original) return original
    if (baseUrl) return parsed.href
  } catch {
    // not a parseable relative URL — fall through to null
  }

  return null
}

function extractImage(item: ParsedItem, baseUrl: string): string | null {
  return resolveImageUrl(
    item.media?.$?.url ||
      item.enclosure?.url ||
      item['content:encoded']?.match(/<img[^>]+src="([^">]+)"/)?.[1],
    baseUrl,
  )
}

// Backup photo source: when a feed doesn't expose an image at all, scrape
// the linked article's og:image/twitter:image meta tag directly. Bounded by
// a timeout so one slow article page can't stall the whole response.
const OG_IMAGE_TIMEOUT_MS = 5000

async function fetchOgImage(articleUrl: string): Promise<string | null> {
  if (!articleUrl) return null
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OG_IMAGE_TIMEOUT_MS)

  try {
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; wtix-news-bot/1.0)' },
    })
    if (!res.ok) return null

    const html = await res.text()
    const metaMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)

    return metaMatch ? resolveImageUrl(metaMatch[1], articleUrl) : null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

async function fetchSource(source: { name: string; url: string }): Promise<NewsItem[]> {
  const feed = await parser.parseURL(source.url)
  const isTrusted = TRUSTED_WOMENS_ONLY_SOURCES.has(source.name)

  const mapped = feed.items.map((item) => {
    const title = item.title ?? ''
    const link = item.link ?? ''
    const excerpt = item.contentSnippet?.slice(0, 160) ?? ''
    return {
      id: item.guid || link || `${source.name}-${title}`,
      title,
      link,
      source: source.name,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      image: extractImage(item, link),
      league: tagLeague(`${title} ${excerpt}`),
      excerpt,
      contentType: 'article' as const,
    }
  })

  // General-audience sources (The GIST) get a content-level women's-sports
  // check; dedicated women's-sports outlets are trusted wholesale.
  const filtered = isTrusted
    ? mapped
    : mapped.filter((item) => isWomensSportsContent(`${item.title} ${item.excerpt}`))

  return filtered.slice(0, 10)
}

export async function fetchNewsItems(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(SOURCES.map(fetchSource))

  const seen = new Set<string>()
  const items: NewsItem[] = []

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const item of result.value) {
      if (!item.link || seen.has(item.link)) continue
      seen.add(item.link)
      items.push(item)
    }
  }

  // Backup photo source for whatever didn't get an image from the feed itself.
  const needsImage = items.filter((item) => !item.image)
  const ogResults = await Promise.allSettled(needsImage.map((item) => fetchOgImage(item.link)))
  needsImage.forEach((item, i) => {
    const result = ogResults[i]
    if (result.status === 'fulfilled' && result.value) item.image = result.value
  })

  return items.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}
