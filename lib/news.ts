import Parser from 'rss-parser'
import type { Sport } from './types'

export interface NewsItem {
  id: string
  title: string
  link: string
  source: string
  league: Sport | "Women's Sports"
  image: string | null
  excerpt: string
  publishedAt: string
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

// ── League tagging ───────────────────────────────────────────────────────────

const LEAGUE_KEYWORDS: Record<Sport, string[]> = {
  WNBA: ['wnba', 'caitlin clark', "a'ja wilson", 'napheesa collier'],
  NWSL: ['nwsl', 'uswnt', 'gotham fc', 'angel city'],
  PWHL: ['pwhl', 'hilary knight'],
  Tennis: ['wta', 'tennis'],
  Golf: ['lpga', "women's golf", "women's pga"],
  College: ['ncaa', 'college basketball', 'march madness', 'college softball', 'college soccer'],
}

function tagLeague(text: string): NewsItem['league'] {
  const lower = text.toLowerCase()
  for (const [league, keywords] of Object.entries(LEAGUE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return league as Sport
  }
  return "Women's Sports"
}

// ── Image extraction ─────────────────────────────────────────────────────────

// Normalizes a raw <img src>/enclosure/media URL into something safe to
// hotlink from wtix's own domain. Handles two cases beyond plain absolute
// URLs: protocol-relative ("//host/path") and Gatsby's remote-file proxy
// path (e.g. The GIST: "/_gatsby/file/<hash>/name.jpg?u=<encoded-original>"),
// which is relative to the source site and 404s if rendered as-is — the
// `u` param holds the real, publicly hosted original image URL.
function resolveImageUrl(rawSrc: string | undefined | null): string | null {
  if (!rawSrc) return null
  if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) return rawSrc
  if (rawSrc.startsWith('//')) return `https:${rawSrc}`

  try {
    const original = new URL(rawSrc, 'https://placeholder.invalid').searchParams.get('u')
    if (original) return original
  } catch {
    // not a parseable relative URL — fall through to null
  }

  return null
}

function extractImage(item: ParsedItem): string | null {
  return resolveImageUrl(
    item.media?.$?.url ||
      item.enclosure?.url ||
      item['content:encoded']?.match(/<img[^>]+src="([^">]+)"/)?.[1],
  )
}

// ── Public API ────────────────────────────────────────────────────────────────

async function fetchSource(source: { name: string; url: string }): Promise<NewsItem[]> {
  const feed = await parser.parseURL(source.url)
  return feed.items.slice(0, 10).map((item) => {
    const title = item.title ?? ''
    return {
      id: item.guid || item.link || `${source.name}-${title}`,
      title,
      link: item.link ?? '',
      source: source.name,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      image: extractImage(item),
      league: tagLeague(`${title} ${item.contentSnippet ?? ''}`),
      excerpt: item.contentSnippet?.slice(0, 160) ?? '',
    }
  })
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

  return items.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}
