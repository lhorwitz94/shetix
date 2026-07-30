'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { NewsItem } from '@/lib/news'

export default function NewsMosaic() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          See all ticket listings
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-4">Women&apos;s Sports News</h1>

      {loaded && items.length === 0 && (
        <p className="text-sm text-gray-400 py-12 text-center">No news available right now — check back soon.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-3">
        {items.map((item, i) => {
          const big = i % 7 === 0
          return (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative group overflow-hidden rounded-xl bg-neutral-900 ${
                big ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
              }`}
            >
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#4a2a70] to-[#1a0638]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 p-3 text-white">
                <span className="text-[10px] uppercase tracking-wide bg-white/20 rounded px-1.5 py-0.5">
                  {item.league}
                </span>
                <h3 className={`mt-1 font-semibold leading-tight ${big ? 'text-lg' : 'text-sm'}`}>
                  {item.title}
                </h3>
                <span className="text-[10px] text-white/60">{item.source}</span>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
