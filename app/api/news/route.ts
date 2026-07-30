import { NextResponse } from 'next/server'
import { fetchNewsItems } from '@/lib/news'
import { readNewsCache, writeNewsCache } from '@/lib/newsCache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cached = await readNewsCache()
  if (cached) return NextResponse.json(cached)

  const items = await fetchNewsItems()
  await writeNewsCache(items)
  return NextResponse.json(items)
}
