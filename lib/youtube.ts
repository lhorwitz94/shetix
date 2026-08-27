import type { NewsItem } from './news'
import type { Sport } from './types'

// "official" — a league's own channel. "outlet" — a media/press
// organization covering women's sports. "creator" — an individual
// personality/creator, not a league or outlet.
type SourceType = 'official' | 'outlet' | 'creator'

interface TrustedChannel {
  label: string
  channelId: string
  league: Sport | "Women's Sports"
  sourceType: SourceType
}

// Verified 2026-07-30 by fetching each channel's public feed directly and
// checking real video titles, not just the channel name — all 5 resolve to
// currently-active channels whose actual content is women's sports. "RE" in
// particular gives no indication from its name alone: it's Christen Press &
// Tobin Heath's show, entirely NWSL/USWNT/Women's World Cup content.
const TRUSTED_CHANNELS: TrustedChannel[] = [
  { label: 'NWSL', channelId: 'UCL4xu08EDu0ZFZsBJUB0chw', league: 'NWSL', sourceType: 'official' },
  { label: 'WNBA', channelId: 'UCO9a_ryN_l7DIDS-VIt-zmw', league: 'WNBA', sourceType: 'official' },
  { label: 'PWHL', channelId: 'UCNKUkQV2R0JKakyE1vuC1lQ', league: 'PWHL', sourceType: 'official' },
  { label: "Just Women's Sports", channelId: 'UCv5306tE1yjLn1D31PL7kFA', league: "Women's Sports", sourceType: 'outlet' },
  { label: 'RE', channelId: 'UCjseWKLbnjmy4PuLBsi2YYA', league: "Women's Sports", sourceType: 'outlet' },
  // Basketball-focused creator (WNBA + college hoops content, interviews,
  // commentary) — not a league or outlet channel, so tagged 'creator'.
  // League bucketed under the "Women's Sports" catch-all rather than a
  // single Sport, same as JWS/RE above, since her content isn't scoped to
  // one league's games the way the official channels are.
  { label: 'Rachel DeMita', channelId: 'UCBS2RdExOLDYVLnfsZ2Q4-w', league: "Women's Sports", sourceType: 'creator' },
]

function matchOne(str: string, regex: RegExp): string | null {
  const match = str.match(regex)
  return match ? match[1] : null
}

function decodeEntities(str: string | null): string {
  if (!str) return ''
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// Lightweight Atom parser — YouTube's public channel feed is a predictable
// format, so regex over pulling in a full XML library is fine here, same
// call as this repo already made for RSS (rss-parser) vs. hand-rolling.
// Verified against real feeds from all 5 trusted channels before relying
// on it (videoId, title, published date, and thumbnail all extract clean,
// including titles with emoji and HTML entities like "&amp;").
function parseYouTubeAtomFeed(xml: string, source: TrustedChannel): NewsItem[] {
  const entries = xml.split('<entry>').slice(1)

  return entries
    .map((entryXml): NewsItem | null => {
      const videoId = matchOne(entryXml, /<yt:videoId>(.*?)<\/yt:videoId>/)
      if (!videoId) return null

      const title = decodeEntities(matchOne(entryXml, /<title>(.*?)<\/title>/))
      const published = matchOne(entryXml, /<published>(.*?)<\/published>/)
      const thumbnail = matchOne(entryXml, /<media:thumbnail url="(.*?)"/)

      return {
        id: `yt-${videoId}`,
        title,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        source: source.label,
        league: source.league,
        image: thumbnail,
        excerpt: '',
        publishedAt: published || new Date().toISOString(),
        contentType: 'video',
      }
    })
    .filter((item): item is NewsItem => item !== null)
}

// YouTube's public feed endpoint intermittently 404s on an otherwise-valid
// channel_id (confirmed by re-running the identical request seconds apart
// against the NWSL channel — first 404, then 200) — one retry covers that
// transient case instead of silently zeroing out a channel for a whole
// fetch cycle.
async function fetchChannelVideos(source: TrustedChannel): Promise<NewsItem[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${source.channelId}`

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) return parseYouTubeAtomFeed(await res.text(), source)
  }

  return []
}

export async function getAllTrustedVideos(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(TRUSTED_CHANNELS.map(fetchChannelVideos))

  const videos: NewsItem[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') videos.push(...result.value)
  }

  return videos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}
