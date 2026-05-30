'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Event } from '@/lib/types'

const SPORT_COLORS: Record<string, { bg: string; text: string }> = {
  WNBA:    { bg: '#fff3e0', text: '#c05000' },
  NWSL:    { bg: '#e6f7ef', text: '#1a7a4a' },
  PWHL:    { bg: '#e0f7fa', text: '#006878' },
  Tennis:  { bg: '#f3ffe0', text: '#4a7000' },
  Golf:    { bg: '#e8f5e9', text: '#2e7d32' },
  College: { bg: '#e3f2fd', text: '#1565c0' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function padDate(n: number) {
  return String(n).padStart(2, '0')
}

function getCalendarCells(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function EventPill({ event }: { event: Event }) {
  const colors = SPORT_COLORS[event.sport] ?? { bg: '#f3f4f6', text: '#374151' }
  return (
    <div
      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 mb-0.5 min-w-0"
      style={{ background: colors.bg }}
    >
      <span
        className="text-[9px] font-bold shrink-0 uppercase tracking-wide"
        style={{ color: colors.text }}
      >
        {event.sport}
      </span>
      <span className="text-[10px] text-gray-700 truncate">{event.title}</span>
    </div>
  )
}

export default function CalendarClient({ events }: { events: Event[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const e of events) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    }
    return map
  }, [events])

  const cells = useMemo(() => getCalendarCells(year, month), [year, month])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back link */}
      <div className="mb-4">
        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to listings
        </Link>
      </div>

      {/* Month nav — centered */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-[#9966CB] hover:text-[#9966CB] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900 w-44 text-center">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-[#9966CB] hover:text-[#9966CB] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Sport legend — centered, below month nav */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {Object.entries(SPORT_COLORS).map(([sport, colors]) => (
            <span key={sport} className="flex items-center gap-1 text-xs font-semibold" style={{ color: colors.text }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.text }} />
              {sport}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dateStr = day ? `${year}-${padDate(month + 1)}-${padDate(day)}` : null
            const dayEvents = dateStr ? (eventsByDate.get(dateStr) ?? []) : []
            const isToday = dateStr === `${today.getFullYear()}-${padDate(today.getMonth() + 1)}-${padDate(today.getDate())}`
            const isSelected = dateStr === selectedDate
            const hasEvents = dayEvents.length > 0
            const MAX_VISIBLE = 3

            return (
              <div
                key={i}
                onClick={() => day && setSelectedDate(isSelected ? null : dateStr)}
                className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 transition-colors ${
                  day ? 'cursor-pointer' : ''
                } ${isSelected ? 'bg-violet-50' : hasEvents ? 'hover:bg-gray-50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-[#9966CB] text-white'
                        : 'text-gray-500'
                    }`}>
                      {day}
                    </div>
                    {dayEvents.slice(0, MAX_VISIBLE).map(e => (
                      <EventPill key={e.id} event={e} />
                    ))}
                    {dayEvents.length > MAX_VISIBLE && (
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedDate(dateStr) }}
                        className="text-[10px] font-semibold text-[#9966CB] pl-1 hover:underline"
                      >
                        +{dayEvents.length - MAX_VISIBLE} more
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day detail panel */}
      {selectedDate && selectedEvents.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </h3>
          <div className="flex flex-col gap-3">
            {selectedEvents.map(e => {
              const colors = SPORT_COLORS[e.sport] ?? { bg: '#f3f4f6', text: '#374151' }
              return (
                <div key={e.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-4">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mt-0.5"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {e.sport}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-sm leading-snug">{e.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {e.venue} · {e.city}, {e.state}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-700">{e.time} ET</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
