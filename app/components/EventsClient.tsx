'use client'

import { useState, useMemo } from 'react'
import type { Event, Sport } from '@/lib/types'
import { SPORTS } from '@/lib/data'
import EventCard from './EventCard'

const SORT_OPTIONS = ['Date', 'Price: Low to High', 'Price: High to Low'] as const
type SortOption = (typeof SORT_OPTIONS)[number]

export default function EventsClient({ events }: { events: Event[] }) {
  const [activeSport, setActiveSport] = useState<Sport | 'All'>('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('Date')

  const filtered = useMemo(() => {
    let out = events

    if (activeSport !== 'All') {
      out = out.filter((e) => e.sport === activeSport)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          (e.subtitle ?? '').toLowerCase().includes(q),
      )
    }

    const minPrice = (e: Event) => {
      const prices = e.markets.map((m) => m.minPrice).filter((p) => p > 0)
      return prices.length > 0 ? Math.min(...prices) : Infinity
    }

    if (sort === 'Date') {
      out = [...out].sort((a, b) => a.date.localeCompare(b.date))
    } else if (sort === 'Price: Low to High') {
      out = [...out].sort((a, b) => minPrice(a) - minPrice(b))
    } else {
      out = [...out].sort((a, b) => minPrice(b) - minPrice(a))
    }

    return out
  }, [events, activeSport, search, sort])

  return (
    <div>
      {/* Search + sort bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams, venues, or cities…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9966CB] focus:border-transparent transition"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="sm:w-52 px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9966CB] cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Sport filter pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {(['All', ...SPORTS] as const).map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeSport === sport
                  ? 'bg-[#9966CB] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#c4a0e0] hover:text-[#9966CB]'
              }`}
            >
              {sport}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Event grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm mt-1">Try a different sport or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
