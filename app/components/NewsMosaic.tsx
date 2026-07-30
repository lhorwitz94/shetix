'use client'

import { useEffect, useState } from 'react'
import type { NewsItem } from '@/lib/news'

export default function NewsMosaic() {
  const [items, setItems] = useState<NewsItem[]>([])

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Women&apos;s Sports News</h2>
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
